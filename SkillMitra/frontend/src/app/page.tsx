"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  api,
  type Course,
  type District,
  type IndustryDemand,
  type IndustrySector,
  type JobPosting,
  type Skill,
} from "@/lib/api";
import {
  ChevronRight,
  LineChart,
  Map,
  Route,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const ENGINE_STEPS = [
  "Labour Market Data",
  "Demand Analysis",
  "Job Roles",
  "Skills",
  "Skill Gaps",
  "Course Alignment",
  "Training Capacity",
  "Employer Validation",
  "Placement",
  "District Plan",
];

const SIGNAL_FLOW = [
  "Industry Demand",
  "Emerging Job Roles",
  "Required Skills",
  "Skill Gaps",
  "Course Alignment",
  "Training Capacity",
  "Placement Outcomes",
  "District Action",
];

const SECTION_INDEX: Record<string, string> = {
  home: "01",
  demand: "02",
  engine: "03",
  curriculum: "04",
  capacity: "05",
  employers: "06",
  planning: "07",
  career: "08",
  gaps: "09",
  outcomes: "10",
  roles: "11",
};

const DEMO_DISTRICTS: District[] = [
  { id: "pune", name: "Pune", code: "MH12", state_code: "MH" },
  { id: "mumbai", name: "Mumbai", code: "MH01", state_code: "MH" },
  { id: "nashik", name: "Nashik", code: "MH17", state_code: "MH" },
  { id: "nagpur", name: "Nagpur", code: "MH31", state_code: "MH" },
  { id: "kolhapur", name: "Kolhapur", code: "MH10", state_code: "MH" },
];

const DEMO_SECTORS: IndustrySector[] = [
  { id: "it", name: "Information Technology", code: "IT", description: "IT & Digital Services" },
  { id: "automotive", name: "Automotive & EV", code: "AUTO", description: "Automotive and Electric Vehicles" },
  { id: "manufacturing", name: "Advanced Manufacturing", code: "MFG", description: "Advanced Manufacturing" },
  { id: "healthcare", name: "Healthcare", code: "HLT", description: "Healthcare Services" },
  { id: "finance", name: "Financial Services", code: "FIN", description: "Financial Services" },
  { id: "logistics", name: "Logistics", code: "LOG", description: "Logistics and Supply Chain" },
  { id: "green", name: "Green Energy", code: "GRN", description: "Green Energy and Sustainability" },
];

const DEMO_CAREER_PATHWAYS: Record<string, { role: string; skills: string[]; gap: string[]; course: string; jobs: string[] }> = {
  it: {
    role: "Data Analyst",
    skills: ["Python", "SQL", "Excel", "Power BI", "Statistics"],
    gap: ["SQL", "Power BI"],
    course: "Data Analytics",
    jobs: ["Junior Data Analyst", "Business Data Analyst", "Reporting Analyst"],
  },
  automotive: {
    role: "EV Technician",
    skills: ["Electrical Systems", "Battery Technology", "Diagnostics", "Safety Protocols"],
    gap: ["Battery Technology", "Diagnostics"],
    course: "EV Technician Training",
    jobs: ["EV Service Technician", "Battery Specialist", "Diagnostic Engineer"],
  },
  manufacturing: {
    role: "CNC Operator",
    skills: ["CNC Programming", "Machine Operation", "Quality Control", "Blueprint Reading"],
    gap: ["CNC Programming", "Quality Control"],
    course: "CNC Machine Operation",
    jobs: ["CNC Operator", "Machine Programmer", "Quality Inspector"],
  },
  healthcare: {
    role: "Medical Lab Technician",
    skills: ["Lab Techniques", "Sample Analysis", "Equipment Operation", "Quality Assurance"],
    gap: ["Sample Analysis", "Quality Assurance"],
    course: "Medical Laboratory Technology",
    jobs: ["Lab Technician", "Sample Analyst", "Quality Control Technician"],
  },
  finance: {
    role: "Financial Analyst",
    skills: ["Financial Modeling", "Excel", "Risk Analysis", "Reporting"],
    gap: ["Financial Modeling", "Risk Analysis"],
    course: "Financial Analysis",
    jobs: ["Financial Analyst", "Risk Analyst", "Investment Analyst"],
  },
  logistics: {
    role: "Supply Chain Coordinator",
    skills: ["Inventory Management", "Logistics Software", "Vendor Management", "Documentation"],
    gap: ["Logistics Software", "Vendor Management"],
    course: "Supply Chain Management",
    jobs: ["Supply Chain Coordinator", "Logistics Manager", "Inventory Controller"],
  },
  green: {
    role: "Solar Technician",
    skills: ["Solar Panel Installation", "Electrical Systems", "Maintenance", "Safety Standards"],
    gap: ["Solar Panel Installation", "Maintenance"],
    course: "Solar Energy Technician",
    jobs: ["Solar Installer", "Maintenance Technician", "Site Supervisor"],
  },
};

const DEMO_DISTRICT_DATA: Record<string, { industries: string[]; roles: string[]; skills: string[]; capacity: string; gap: string; action: string }> = {
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

const NAV = [
  { href: "#home", label: "Home" },
  { href: "#demand", label: "Labour Market Intelligence" },
  { href: "#gaps", label: "Skill Gaps" },
  { href: "#curriculum", label: "Courses & Curriculum" },
  { href: "#capacity", label: "Training Capacity" },
  { href: "#employers", label: "Employer Insights" },
  { href: "#outcomes", label: "Jobs & Outcomes" },
  { href: "#planning", label: "District Planning" },
];

export default function Home() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileNav, setMobileNav] = useState(false);
  const [fontScale, setFontScale] = useState<"sm" | "md" | "lg">("md");
  const [lang, setLang] = useState<"en" | "mr">("en");
  const [activeHash, setActiveHash] = useState("#home");

  const [districts, setDistricts] = useState<District[]>([]);
  const [sectors, setSectors] = useState<IndustrySector[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [industryDemand, setIndustryDemand] = useState<IndustryDemand[]>([]);
  const [courseTotal, setCourseTotal] = useState<number | null>(null);
  const [jobTotal, setJobTotal] = useState<number | null>(null);
  const [dataStatus, setDataStatus] = useState<"loading" | "ready" | "unavailable">("loading");

  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [districtDemand, setDistrictDemand] = useState<IndustryDemand[]>([]);
  const [districtCourses, setDistrictCourses] = useState<{ course_title: string }[]>([]);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [districtError, setDistrictError] = useState("");

  const [interest, setInterest] = useState("");

  // Recommendation engine state
  const [recDistrict, setRecDistrict] = useState("");
  const [recSector, setRecSector] = useState("");
  const [recRole, setRecRole] = useState("");
  const [recRoles, setRecRoles] = useState<Array<{ id: string; title: string; industry_sector_id: string | null }>>([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recResult, setRecResult] = useState<{
    demand: { district_name: string | null; industry_sector_name: string | null; job_role_title: string | null; demand_score: number | null; demand_signals_count: number; relevant_job_postings_count: number; demand_trend: string | null } | null;
    required_skills: Array<{ id: string; name: string; description: string | null }>;
    candidate_skills: Array<{ id: string; name: string; description: string | null }>;
    skill_match_percentage: number;
    matched_skill_count: number;
    total_required_skills: number;
    missing_skills: Array<{ id: string; name: string; description: string | null }>;
    recommended_courses: Array<{ id: string; title: string; description: string | null; covers: string[]; why: string }>;
    job_readiness_percentage: number;
    candidate_authenticated: boolean;
    message: string | null;
  } | null>(null);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [suggestionResult, setSuggestionResult] = useState<Array<{ job_role_title: string; required_skill_ids: string[]; matched_skill_ids: string[]; missing_skill_ids: string[]; demand_signal_count: number; relevant_course_count: number; reasons: string[] }>>([]);
  const [skillGapLoading, setSkillGapLoading] = useState(false);
  const [skillGapResult, setSkillGapResult] = useState<{ job_role_title: string; required_skills: Array<{ id: string; name: string }>; matched_skills: Array<{ id: string; name: string }>; missing_skills: Array<{ id: string; name: string }>; skill_match_percentage: number; recommended_courses: Array<{ title: string; covers: string[]; why: string }> } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [districtRes, sectorRes, skillRes, courseRes, jobRes, demandRes] = await Promise.all([
          api.districts().catch(() => []),
          api.sectors().catch(() => []),
          api.skills().catch(() => ({ items: [], total: 0 })),
          api.courses().catch(() => ({ items: [], total: 0 })),
          api.jobs().catch(() => ({ items: [], total: 0 })),
          api.demandIndustries().catch(() => []),
        ]);
        if (cancelled) return;

        // Always use real data if available
        setDistricts(districtRes);
        setSectors(sectorRes);
        setSkills(skillRes.items ?? []);
        setCourses(courseRes.items ?? []);
        setJobs(jobRes.items ?? []);
        setIndustryDemand(demandRes);
        setCourseTotal(typeof courseRes.total === "number" ? courseRes.total : null);
        setJobTotal(typeof jobRes.total === "number" ? jobRes.total : null);
        setDataStatus("ready");
      } catch (error) {
        if (!cancelled) {
          const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
          console.error("API error:", error);
          // Only use demo data when API genuinely fails
          if (demoMode) {
            setDistricts(DEMO_DISTRICTS);
            setSectors(DEMO_SECTORS);
            setDataStatus("ready");
          } else {
            setDistricts([]);
            setSectors([]);
            setDataStatus("unavailable");
          }
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);



  useEffect(() => {
    const syncHash = () => setActiveHash(window.location.hash || "#home");
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove("font-sm", "font-lg");
    if (fontScale === "sm") document.documentElement.classList.add("font-sm");
    if (fontScale === "lg") document.documentElement.classList.add("font-lg");
  }, [fontScale]);

  useEffect(() => {
    document.documentElement.lang = lang === "mr" ? "mr" : "en";
  }, [lang]);

  useEffect(() => {
    if (!selectedDistrict) return;
    let cancelled = false;
    (async () => {
      try {
        const [demand, covered] = await Promise.all([
          api.demandByDistrict(selectedDistrict),
          api.demandCourses(selectedDistrict).catch(() => []),
        ]);
        if (cancelled) return;
        setDistrictDemand(demand);
        setDistrictCourses(covered);
        setDistrictError("");
      } catch (error) {
        if (!cancelled) {
          const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
          console.error("District API error:", error);
          // Only use demo data when API genuinely fails
          if (demoMode && DEMO_DISTRICT_DATA[selectedDistrict]) {
            setDistrictDemand([]);
            setDistrictCourses([]);
            setDistrictError("DEMO_MODE"); // Special marker to trigger demo UI
          } else {
            setDistrictDemand([]);
            setDistrictCourses([]);
            setDistrictError(error instanceof Error ? error.message : "District intelligence could not be loaded.");
          }
        }
      } finally {
        if (!cancelled) setDistrictLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedDistrict]);

  // Load job roles when sector changes
  useEffect(() => {
    if (!recSector) {
      setRecRoles([]);
      setRecRole("");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const roles = await api.jobRoles(recSector);
        if (cancelled) return;
        setRecRoles(roles);
        setRecRole("");
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load job roles:", error);
          setRecRoles([]);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [recSector]);

  // Load recommendation when role changes
  useEffect(() => {
    if (!recRole) {
      setRecResult(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setRecLoading(true);
      try {
        const result = await api.careerRecommendation({
          district_id: recDistrict || undefined,
          industry_sector_id: recSector || undefined,
          job_role_id: recRole,
        });
        if (cancelled) return;
        setRecResult(result);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load recommendation:", error);
          setRecResult(null);
        }
      } finally {
        if (!cancelled) setRecLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [recRole, recDistrict, recSector]);

  const getCareerSuggestions = async () => {
    if (!interest) return;
    setSuggestionLoading(true);
    try {
      // Find sector matching the interest
      const sector = sectors.find(s => s.id === interest || s.name.toLowerCase().includes(interest.toLowerCase()));
      if (!sector) {
        setSuggestionResult([]);
        return;
      }
      const roles = await api.jobRoles(sector.id);
      const results = await Promise.all(
        roles.slice(0, 4).map(async (role) => {
          try {
            const rec = await api.careerRecommendation({
              industry_sector_id: sector.id,
              job_role_id: role.id,
            });
            return {
              job_role_title: rec.demand?.job_role_title || role.title,
              required_skill_ids: rec.required_skills.map(s => s.id),
              matched_skill_ids: rec.candidate_skills.map(s => s.id),
              missing_skill_ids: rec.missing_skills.map(s => s.id),
              demand_signal_count: rec.demand?.demand_signals_count || 0,
              relevant_course_count: rec.recommended_courses.length,
              reasons: rec.message ? [rec.message] : ["Real data from platform"],
            };
          } catch {
            return {
              job_role_title: role.title,
              required_skill_ids: [],
              matched_skill_ids: [],
              missing_skill_ids: [],
              demand_signal_count: 0,
              relevant_course_count: 0,
              reasons: ["Data loading failed"],
            };
          }
        })
      );
      setSuggestionResult(results);
    } catch (error) {
      console.error("Failed to get career suggestions:", error);
      setSuggestionResult([]);
    } finally {
      setSuggestionLoading(false);
    }
  };

  const checkSkillGap = async () => {
    // Use the first selected role or the first available role in the sector
    let roleId = recRole;
    if (!roleId && recSector && recRoles.length > 0) {
      roleId = recRoles[0].id;
    }
    if (!roleId) return;
    setSkillGapLoading(true);
    try {
      const rec = await api.careerRecommendation({
        district_id: recDistrict || undefined,
        industry_sector_id: recSector || undefined,
        job_role_id: roleId,
      });
      setSkillGapResult({
        job_role_title: rec.demand?.job_role_title || "Selected Role",
        required_skills: rec.required_skills,
        matched_skills: rec.candidate_skills,
        missing_skills: rec.missing_skills,
        skill_match_percentage: rec.skill_match_percentage,
        recommended_courses: rec.recommended_courses.map(c => ({ title: c.title, covers: c.covers, why: c.why })),
      });
    } catch (error) {
      console.error("Failed to check skill gap:", error);
      setSkillGapResult(null);
    } finally {
      setSkillGapLoading(false);
    }
  };

  const sectorById = useMemo(
    () => Object.fromEntries(sectors.map((sector) => [sector.id, sector.name])),
    [sectors],
  );
  const skillById = useMemo(
    () => Object.fromEntries(skills.map((skill) => [skill.id, skill.name])),
    [skills],
  );
  const districtById = useMemo(
    () => Object.fromEntries(districts.map((district) => [district.id, district.name])),
    [districts],
  );

  const selectedDistrictName = districtById[selectedDistrict];
  const activeDemand = selectedDistrict ? districtDemand : [];
  const activeDistrictCourses = selectedDistrict ? districtCourses : [];
  const priorityIndustries = uniqueNames(
    activeDemand.map((row) => sectorById[row.industry_sector_id]).filter(Boolean),
  );
  const highDemandSkills = uniqueNames(
    activeDemand.map((row) => (row.skill_id ? skillById[row.skill_id] : "")).filter(Boolean),
  );
  const localCourses = selectedDistrict
    ? courses.filter((course) => course.district_id === selectedDistrict)
    : [];
  const roleRecordCount = uniqueNames(
    activeDemand.map((row) => row.job_role_id).filter(Boolean) as string[],
  ).length;
  const publishedCoverage = localCourses.length || activeDistrictCourses.length;
  const capacityGapItems = selectedDistrict
    ? activeDemand.length && !publishedCoverage
      ? ["Demand is recorded without published course coverage for this district."]
      : activeDemand.length
        ? [
            "Use authorised district views to compare seats, trainers and equipment against recorded demand.",
          ]
        : ["Capacity-gap figures are shown in authorised district intelligence views."]
    : [];
  const statewideDemandSectors = uniqueNames(
    industryDemand.map((row) => sectorById[row.industry_sector_id]).filter(Boolean),
  );

  const selectedSector = sectors.find((sector) => sector.id === interest);

  const diverseJobs = useMemo(() => {
    if (!jobs.length) return [];
    const seen = new Set<string>();
    const diverse: JobPosting[] = [];
    for (const job of jobs) {
      const key = `${job.title}|${job.district_id || "none"}|${job.job_posting_skills?.map(s => s.skill_id).join(",") || "none"}`;
      if (!seen.has(key)) {
        seen.add(key);
        diverse.push(job);
      }
      if (diverse.length >= 6) break;
    }
    return diverse;
  }, [jobs]);

  return (
    <main className="min-h-screen bg-[#f4f7fa] text-[#1b2838]">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="bg-[#123b68] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-2 text-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <BrandMark
              src="/maharashtra-gov-logo.png"
              alt="Emblem of the Government of Maharashtra"
              className="h-9 w-auto bg-white/10 p-0.5"
            />
            <p>
              Government of Maharashtra
              <span className="mx-2 hidden sm:inline" aria-hidden>
                |
              </span>
              <span className="block sm:inline">
                Skills, Employment, Entrepreneurship &amp; Innovation Department
              </span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <button type="button" onClick={() => setLang("mr")} aria-pressed={lang === "mr"}>
              मराठी
            </button>
            <span aria-hidden>|</span>
            <button type="button" onClick={() => setLang("en")} aria-pressed={lang === "en"}>
              English
            </button>
            <span aria-hidden>|</span>
            <button type="button" onClick={() => setFontScale("lg")} aria-label="Increase text size">
              A+
            </button>
            <button type="button" onClick={() => setFontScale("md")} aria-label="Default text size">
              A
            </button>
            <button type="button" onClick={() => setFontScale("sm")} aria-label="Decrease text size">
              A-
            </button>
          </div>
        </div>
      </div>

      <div className="h-1 bg-[#c2410c]" aria-hidden />

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3">
          <div className="flex min-w-0 items-center gap-4">
            <BrandMark src="/skillmitra-logo.png" alt="SkillMitra" className="h-16 w-auto sm:h-20" />
            <div className="min-w-0">
              <p className="font-serif text-xl font-semibold text-[#123b68] sm:text-2xl">SkillMitra</p>
              <p className="text-sm text-slate-600">Labour Market Intelligence and Skill Development Planning</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="md:hidden rounded border border-[#123b68] px-3 py-2 text-sm font-semibold text-[#123b68]"
              aria-expanded={mobileNav}
              aria-controls="primary-navigation"
              onClick={() => setMobileNav((open) => !open)}
            >
              Menu
            </button>
            {user ? (
              <div className="flex items-center gap-3">
                <p className="hidden text-sm text-slate-700 sm:block">
                  Signed in as <span className="font-semibold">{user.full_name}</span>
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    router.push('/');
                  }}
                  className="text-sm font-semibold text-slate-700 hover:text-[#123b68]"
                >
                  Logout
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="bg-[#123b68] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0d2d52]"
                >
                  Dashboard
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="bg-[#123b68] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0d2d52]"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="border border-[#123b68] bg-white px-5 py-2.5 text-sm font-semibold text-[#123b68] hover:bg-slate-50"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        <nav id="primary-navigation" className="border-t border-slate-200 bg-white" aria-label="Primary">
          <ul className={`${mobileNav ? "flex" : "hidden"} max-w-7xl flex-col md:mx-auto md:flex md:flex-row md:flex-wrap`}>
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setMobileNav(false)}
                  className={`block whitespace-nowrap px-5 py-3 text-sm font-semibold hover:bg-slate-50 hover:text-[#123b68] ${
                    activeHash === item.href
                      ? "border-b-4 border-[#123b68] text-[#123b68]"
                      : "border-b-4 border-transparent text-slate-700"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <div id="main-content">
        {dataStatus === "unavailable" ? (
          <p className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-center text-sm text-amber-950">
            Live catalogue data could not be loaded. Descriptive platform sections remain available.
          </p>
        ) : null}
        <section id="home" className="border-b border-slate-200 bg-[#eef3f8]">
          <div className="mx-auto grid max-w-7xl items-start gap-8 px-5 py-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:py-10">
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-[#c2410c]">
                MAHARASHTRA SKILL DEVELOPMENT • LABOUR MARKET INTELLIGENCE
              </p>
              <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight text-[#123b68] md:text-4xl">
                Turning Labour Market Demand into Better Training Outcomes.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700 md:text-lg">
                SkillMitra connects labour-market intelligence, employer requirements, skill gaps,
                courses, training capacity and placement outcomes to support evidence-based skill
                development planning across Maharashtra.
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                For government departments, district planners, training providers, employers and
                candidates. The aim is to reduce skill mismatch and improve training-to-employment
                outcomes.
              </p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#123b68]">
                Data → Insight → Action → Outcome
              </p>
              {lang === "mr" ? (
                <p className="mt-3 text-sm text-slate-600">
                  मराठी भाषांतर सध्या मर्यादित आहे. मुख्य मजकूर इंग्रजीत दाखवला आहे.
                </p>
              ) : null}
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#demand"
                  className="bg-[#123b68] px-6 py-3 font-semibold text-white hover:bg-[#0c2d51]"
                >
                  Explore Labour Market Intelligence
                </a>
                <a
                  href="#planning"
                  className="border border-[#123b68] bg-white px-6 py-3 font-semibold text-[#123b68] hover:bg-slate-50"
                >
                  Explore District Planning
                </a>
                <a
                  href="#career"
                  className="border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Explore Career Pathways
                </a>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-slate-300 pt-6">
                <div>
                  <p className="text-2xl font-semibold text-[#123b68]">36</p>
                  <p className="text-xs text-slate-500">Maharashtra districts</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[#123b68]">{courses.length || 15}</p>
                  <p className="text-xs text-slate-500">Courses listed</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[#123b68]">{jobs.length || 17}</p>
                  <p className="text-xs text-slate-500">Labour-market opening records</p>
                </div>
              </div>
            </div>

            <aside className="border border-slate-300 bg-white p-4" aria-labelledby="signal-panel-heading">
              <p className="text-xs font-semibold tracking-wide text-slate-500">LABOUR MARKET SIGNALS</p>
              <h2 id="signal-panel-heading" className="mt-1 text-lg font-semibold text-[#123b68]">
                Demand → Action
              </h2>
              <ol className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {SIGNAL_FLOW.map((step, index) => (
                  <li key={step} className="flex items-start gap-2 border border-slate-200 bg-[#f8fafc] px-2 py-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-[#123b68] text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="text-sm font-semibold leading-5 text-[#123b68]">{step}</span>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        </section>

        {/* ================= DEMAND-TO-CAREER RECOMMENDATION ENGINE ================= */}
        <section id="recommendation" className="border-b border-slate-200 bg-[#eef3f8]">
          <div className="mx-auto max-w-7xl px-5 py-8 lg:py-10">
            <div className="border-t-2 border-[#c2410c] pt-6">
              <p className="text-xs font-semibold tracking-wide text-[#c2410c]">PS 26134 DEMAND-TO-CAREER ENGINE</p>
              <h2 className="mt-2 font-serif text-3xl font-semibold text-[#123b68]">
                From Industry Demand to Career Recommendation
              </h2>
              <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                See how local industry demand translates into required skills, identifies your skill gaps and recommends the right learning pathway.
              </p>
            </div>

            {/* Cascading selectors */}
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div>
                <label htmlFor="rec-district" className="block text-sm font-semibold text-slate-700">District</label>
                <select
                  id="rec-district"
                  value={recDistrict}
                  onChange={(e) => { setRecDistrict(e.target.value); setRecSector(""); setRecRole(""); setRecResult(null); }}
                  className="mt-2 w-full border border-slate-300 bg-white px-3 py-3"
                >
                  <option value="">Select district</option>
                  {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="rec-sector" className="block text-sm font-semibold text-slate-700">Industry / Sector</label>
                <select
                  id="rec-sector"
                  value={recSector}
                  onChange={(e) => { setRecSector(e.target.value); setRecRole(""); setRecResult(null); }}
                  className="mt-2 w-full border border-slate-300 bg-white px-3 py-3"
                >
                  <option value="">Select sector</option>
                  {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="rec-role" className="block text-sm font-semibold text-slate-700">Job Role</label>
                <select
                  id="rec-role"
                  value={recRole}
                  onChange={(e) => setRecRole(e.target.value)}
                  className="mt-2 w-full border border-slate-300 bg-white px-3 py-3"
                >
                  <option value="">Select job role</option>
                  {recRoles.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
                </select>
              </div>
            </div>

            {recLoading && (
              <div className="mt-6 text-sm text-slate-600">Loading recommendation...</div>
            )}

            {!recLoading && recResult && (
              <div className="mt-8 space-y-6">
                {/* Demand Card */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#c2410c]">Current Industry Demand</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-xs text-slate-500">District</p>
                      <p className="font-semibold text-[#123b68]">{recResult.demand?.district_name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Industry</p>
                      <p className="font-semibold text-[#123b68]">{recResult.demand?.industry_sector_name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Job Role</p>
                      <p className="font-semibold text-[#123b68]">{recResult.demand?.job_role_title || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Demand Trend</p>
                      <p className="font-semibold text-[#123b68]">{recResult.demand?.demand_trend || "No validated demand data available."}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                    <span>Demand signals: {recResult.demand?.demand_signals_count ?? 0}</span>
                    <span>Relevant job postings: {recResult.demand?.relevant_job_postings_count ?? 0}</span>
                    {recResult.demand?.demand_score != null && <span>Score: {recResult.demand.demand_score.toFixed(1)}</span>}
                  </div>
                </div>

                {/* Required Skills */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Required Skills</p>
                  {recResult.required_skills.length > 0 ? (
                    <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {recResult.required_skills.map((s) => (
                        <li key={s.id} className="flex items-center gap-2 text-sm text-slate-700">
                          <span className="text-green-600">✓</span> {s.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-slate-600">No required skills recorded for this role.</p>
                  )}
                </div>

                {/* Candidate Skills + Skill Match */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Your Current Skills</p>
                    {recResult.candidate_skills.length > 0 ? (
                      <ul className="mt-4 space-y-2">
                        {recResult.candidate_skills.map((s) => (
                          <li key={s.id} className="flex items-center gap-2 text-sm text-slate-700">
                            <span className="text-green-600">✓</span> {s.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-slate-600">
                        {recResult.candidate_authenticated ? "No candidate skills available yet." : "Login to compare your skills with this role."}
                      </p>
                    )}
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#123b68]">Skill Match</p>
                    <div className="mt-4">
                      <p className="text-4xl font-bold text-[#123b68]">{recResult.skill_match_percentage.toFixed(0)}%</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {recResult.matched_skill_count} of {recResult.total_required_skills} required skills matched
                      </p>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-slate-200">
                      <div
                        className="h-2 rounded-full bg-[#123b68]"
                        style={{ width: `${Math.min(recResult.skill_match_percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">Your Skill Gaps</p>
                  {recResult.missing_skills.length > 0 ? (
                    <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {recResult.missing_skills.map((s) => (
                        <li key={s.id} className="flex items-center gap-2 text-sm text-slate-700">
                          <span className="text-orange-600">⚠</span> {s.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-slate-600">Your current skills cover all listed requirements.</p>
                  )}
                </div>

                {/* Recommended Courses */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Recommended Learning</p>
                  {recResult.recommended_courses.length > 0 ? (
                    <ul className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {recResult.recommended_courses.map((c) => (
                        <li key={c.id} className="border border-slate-200 rounded-lg p-4">
                          <p className="font-semibold text-[#123b68]">{c.title}</p>
                          <p className="mt-1 text-xs text-slate-500">{c.why}</p>
                          <p className="mt-2 text-xs text-slate-600">Covers: {c.covers.join(", ")}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-slate-600">No matching course currently available.</p>
                  )}
                </div>

                {/* Job Readiness */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">Job Readiness</p>
                  <div className="mt-4">
                    <p className="text-4xl font-bold text-[#123b68]">{recResult.job_readiness_percentage.toFixed(0)}%</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {recResult.matched_skill_count} / {recResult.total_required_skills} required skills matched
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!recLoading && !recResult && recRole && (
              <div className="mt-6 text-sm text-slate-600">No validated demand data available for this combination.</div>
            )}
          </div>
        </section>

        {/* ================= CAREER EXPLORER ================= */}
        <section id="career-explorer" className="mx-auto max-w-7xl px-5 py-14">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="font-bold text-blue-700">CAREER EXPLORER</p>
              <h2 className="mt-2 text-3xl font-bold text-[#123b68]">Which option best describes you?</h2>
              <p className="mt-2 text-slate-600">Explore career options according to your education and goals.</p>
            </div>
            <div className="text-sm font-semibold text-blue-700">Explore. Learn. Grow.</div>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-4">
            <article className="rounded-xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-3xl">🎓</div>
              <h3 className="mt-4 text-xl font-bold text-[#123b68]">Class 10</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Explore career options after Class 10 and build a strong foundation.</p>
              <button className="mt-5 font-semibold text-blue-700">Explore →</button>
            </article>
            <article className="rounded-xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-3xl">🎓</div>
              <h3 className="mt-4 text-xl font-bold text-[#123b68]">Class 12</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Discover career paths after Class 12 and plan your future.</p>
              <button className="mt-5 font-semibold text-blue-700">Explore →</button>
            </article>
            <article className="rounded-xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-3xl">👨‍🎓</div>
              <h3 className="mt-4 text-xl font-bold text-[#123b68]">Graduate</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Explore opportunities after graduation and advance your career.</p>
              <button className="mt-5 font-semibold text-blue-700">Explore →</button>
            </article>
            <article className="rounded-xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-3xl">💼</div>
              <h3 className="mt-4 text-xl font-bold text-[#123b68]">Job Seeker</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Find skill gaps and relevant employment opportunities.</p>
              <button className="mt-5 font-semibold text-blue-700">Explore →</button>
            </article>
          </div>
        </section>

        {/* ================= PERSONALIZED CAREER SUGGESTIONS ================= */}
        <section className="mx-auto max-w-7xl px-5 pb-14">
          <div className="rounded-xl border border-blue-100 bg-[#f1f7ff] p-7 shadow-sm">
            <div className="grid gap-8 md:grid-cols-[1fr_1.2fr] md:items-center">
              <div>
                <p className="font-bold text-blue-700">PERSONALIZED CAREER SUGGESTIONS</p>
                <h2 className="mt-2 text-2xl font-bold text-[#123b68]">Find careers according to your interests</h2>
                <p className="mt-3 leading-7 text-slate-600">Select your area of interest and get suitable career options, required skills and learning paths.</p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">What are you interested in?</label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <select value={interest} onChange={(e) => setInterest(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600">
                    <option value="">Select your interest</option>
                    <option value="Technology">Technology & IT</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Manufacturing">Manufacturing & EV</option>
                    <option value="Finance">Finance & Banking</option>
                    <option value="Design">Design & Creative</option>
                    <option value="Agriculture">Agriculture & Agri-Tech</option>
                  </select>
                  <button onClick={getCareerSuggestions} disabled={suggestionLoading} className="whitespace-nowrap rounded-lg bg-[#123b68] px-6 py-3 font-semibold text-white hover:bg-[#0d2d52] disabled:opacity-60">Get Career Suggestions →</button>
                </div>
                {suggestionLoading && (
                  <div className="mt-4 rounded-lg border border-blue-100 bg-white p-4">
                    <p className="text-sm font-semibold text-blue-700">Loading career suggestions...</p>
                  </div>
                )}
                {!suggestionLoading && suggestionResult.length > 0 && (
                  <div className="mt-4 rounded-lg border border-blue-100 bg-white p-4">
                    <p className="text-sm font-semibold text-blue-700">Suggested Career Paths</p>
                    <div className="mt-3 space-y-3">
                      {suggestionResult.map((s, i) => (
                        <div key={i} className="border-b pb-3 last:border-0">
                          <p className="font-semibold text-[#123b68]">{s.job_role_title}</p>
                          <p className="text-xs text-slate-500 mt-1">Demand signals: {s.demand_signal_count} | Relevant courses: {s.relevant_course_count}</p>
                          {s.required_skill_ids.length > 0 && (
                            <p className="text-xs text-slate-600 mt-1">Required skills: {s.required_skill_ids.length} | Matched: {s.matched_skill_ids.length} | Missing: {s.missing_skill_ids.length}</p>
                          )}
                          {s.reasons.map((r, ri) => <p key={ri} className="text-xs text-slate-500">• {r}</p>)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {!suggestionLoading && interest && suggestionResult.length === 0 && (
                  <div className="mt-4 rounded-lg border border-blue-100 bg-white p-4">
                    <p className="text-sm font-semibold text-blue-700">Suggested Career Paths</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">No matching career paths found for this interest. Try another sector.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ================= QUICK SERVICES ================= */}
        <section className="mx-auto max-w-7xl px-5 pb-14">
          <div className="grid gap-5 md:grid-cols-4">
            <article className="rounded-xl border border-green-100 bg-green-50 p-6">
              <div className="text-3xl">📈</div>
              <h3 className="mt-4 text-lg font-bold text-[#123b68]">Skill Gap Analysis</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Identify skills you have and skills you need.</p>
            </article>
            <article className="rounded-xl border border-blue-100 bg-blue-50 p-6">
              <div className="text-3xl">📚</div>
              <h3 className="mt-4 text-lg font-bold text-[#123b68]">Courses & Training</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Explore government and partner training opportunities.</p>
            </article>
            <article className="rounded-xl border border-orange-100 bg-orange-50 p-6">
              <div className="text-3xl">💼</div>
              <h3 className="mt-4 text-lg font-bold text-[#123b68]">Jobs & Opportunities</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Find relevant job openings based on your skills.</p>
            </article>
            <article className="rounded-xl border border-pink-100 bg-pink-50 p-6">
              <div className="text-3xl">📊</div>
              <h3 className="mt-4 text-lg font-bold text-[#123b68]">Industry Demand</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Discover in-demand skills and future job trends.</p>
            </article>
          </div>
        </section>

        {/* ================= SKILL GAP ANALYSIS ================= */}
        <section id="skill-gap-analysis" className="border-y bg-white">
          <div className="mx-auto max-w-7xl px-5 py-14">
            <div className="grid gap-10 md:grid-cols-2 md:items-center">
              <div>
                <p className="font-bold text-green-600">SKILL GAP ANALYSIS</p>
                <h2 className="mt-2 text-3xl font-bold text-[#123b68]">Learn what the industry actually needs</h2>
                <p className="mt-4 leading-7 text-slate-600">Do not choose a course just because it is popular. SkillMitra compares your target job with your current skills and shows exactly what you need to learn.</p>
                <button onClick={checkSkillGap} disabled={skillGapLoading} className="mt-6 rounded bg-[#123b68] px-6 py-3 font-semibold text-white disabled:opacity-60">Check My Skill Gap →</button>
                {skillGapLoading && <p className="mt-2 text-sm text-slate-600">Loading skill gap analysis...</p>}
              </div>
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                {skillGapResult ? (
                  <>
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <p className="text-xs text-slate-500">TARGET ROLE</p>
                        <h3 className="text-xl font-bold text-[#123b68]">{skillGapResult.job_role_title}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">{skillGapResult.skill_match_percentage.toFixed(0)}%</p>
                        <p className="text-xs text-slate-500">Job Readiness</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      {skillGapResult.required_skills.map((s) => {
                        const isMatched = skillGapResult.matched_skills.some((ms) => ms.id === s.id);
                        return (
                          <div key={s.id} className="flex items-center justify-between border-b py-3">
                            <span className="font-medium">{s.name}</span>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isMatched ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                              {isMatched ? "✓ Ready" : "⚠ Needs improvement"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {skillGapResult.recommended_courses.length > 0 && (
                      <div className="mt-4 border-t pt-4">
                        <p className="text-sm font-semibold text-[#123b68]">Recommended Courses</p>
                        <ul className="mt-2 space-y-2">
                          {skillGapResult.recommended_courses.map((c, i) => (
                            <li key={i} className="text-sm text-slate-700">
                              <span className="font-semibold">{c.title}</span>
                              <span className="text-slate-500"> — {c.why}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <p className="text-xs text-slate-500">TARGET ROLE</p>
                        <h3 className="text-xl font-bold text-[#123b68]">Select a role</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">—</p>
                        <p className="text-xs text-slate-500">Job Readiness</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-slate-600">Click "Check My Skill Gap" to analyze your skills against a target role.</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ================= COURSES & TRAINING ================= */}
        <section id="courses-training" className="border-y bg-slate-50">
          <div className="mx-auto max-w-7xl px-5 py-14">
            <p className="font-bold text-blue-700">LEARNING PATHWAYS</p>
            <h2 className="mt-2 text-3xl font-bold text-[#123b68]">Courses & Training aligned with demand</h2>
            <p className="mt-2 text-slate-600">Courses recommended according to industry demand and skill gaps.</p>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              <article className="rounded-xl border bg-white p-6 shadow-sm">
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">High Demand</span>
                <h3 className="mt-5 text-xl font-bold text-[#123b68]">Data Analytics</h3>
                <p className="mt-3 text-sm text-slate-600">Python • SQL • Power BI</p>
                <button className="mt-5 font-semibold text-blue-700">View Course →</button>
              </article>
              <article className="rounded-xl border bg-white p-6 shadow-sm">
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">Growing</span>
                <h3 className="mt-5 text-xl font-bold text-[#123b68]">Electric Vehicle Technician</h3>
                <p className="mt-3 text-sm text-slate-600">EV Systems • Battery • Diagnostics</p>
                <button className="mt-5 font-semibold text-blue-700">View Course →</button>
              </article>
              <article className="rounded-xl border bg-white p-6 shadow-sm">
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">High Demand</span>
                <h3 className="mt-5 text-xl font-bold text-[#123b68]">Cloud Computing</h3>
                <p className="mt-3 text-sm text-slate-600">AWS • Linux • Networking</p>
                <button className="mt-5 font-semibold text-blue-700">View Course →</button>
              </article>
            </div>
          </div>
        </section>

        {/* ================= JOBS ================= */}
        <section id="jobs-opportunities" className="border-y bg-white">
          <div className="mx-auto max-w-7xl px-5 py-14">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="font-bold text-blue-600">EMPLOYMENT</p>
                <h2 className="mt-2 text-3xl font-bold text-[#123b68]">Jobs matching industry demand</h2>
                <p className="mt-2 text-slate-600">Connect training and skills with real employment opportunities.</p>
              </div>
              <button className="font-semibold text-[#123b68]">View All Jobs →</button>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              <article className="rounded-xl border bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Technology Company</p>
                <h3 className="mt-2 text-xl font-bold text-[#123b68]">Junior Data Analyst</h3>
                <p className="mt-2 text-sm">📍 Pune</p>
                <p className="mt-3 text-sm text-slate-600">Skills: Python • SQL • Excel</p>
                <button className="mt-5 rounded border border-[#123b68] px-4 py-2 text-sm font-semibold text-[#123b68]">View Job</button>
              </article>
              <article className="rounded-xl border bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Manufacturing Company</p>
                <h3 className="mt-2 text-xl font-bold text-[#123b68]">EV Technician</h3>
                <p className="mt-2 text-sm">📍 Nashik</p>
                <p className="mt-3 text-sm text-slate-600">Skills: EV Systems • Diagnostics</p>
                <button className="mt-5 rounded border border-[#123b68] px-4 py-2 text-sm font-semibold text-[#123b68]">View Job</button>
              </article>
              <article className="rounded-xl border bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">IT Services</p>
                <h3 className="mt-2 text-xl font-bold text-[#123b68]">Cloud Support Associate</h3>
                <p className="mt-2 text-sm">📍 Mumbai</p>
                <p className="mt-3 text-sm text-slate-600">Skills: Linux • Cloud • Networking</p>
                <button className="mt-5 rounded border border-[#123b68] px-4 py-2 text-sm font-semibold text-[#123b68]">View Job</button>
              </article>
            </div>
          </div>
        </section>

        {/* ================= TRAINING CAPACITY ================= */}
        <section className="mx-auto max-w-7xl px-5 py-14">
          <div className="rounded-xl border bg-white p-7 shadow-sm">
            <p className="font-bold text-purple-700">TRAINING CAPACITY</p>
            <h2 className="mt-2 text-3xl font-bold text-[#123b68]">Are training opportunities available where they are needed?</h2>
            <p className="mt-3 max-w-3xl leading-7 text-slate-600">Compare industry demand with available training centres, seats and courses to identify capacity gaps across districts.</p>
            <div className="mt-8 grid gap-5 md:grid-cols-4">
              <div className="rounded-lg border bg-slate-50 p-5 text-center">
                <p className="text-3xl font-bold text-[#123b68]">320+</p>
                <p className="mt-2 text-sm text-slate-600">Training Centres</p>
              </div>
              <div className="rounded-lg border bg-slate-50 p-5 text-center">
                <p className="text-3xl font-bold text-[#123b68]">18,500+</p>
                <p className="mt-2 text-sm text-slate-600">Training Seats</p>
              </div>
              <div className="rounded-lg border bg-slate-50 p-5 text-center">
                <p className="text-3xl font-bold text-[#123b68]">145+</p>
                <p className="mt-2 text-sm text-slate-600">Active Courses</p>
              </div>
              <div className="rounded-lg border bg-slate-50 p-5 text-center">
                <p className="text-3xl font-bold text-[#123b68]">72%</p>
                <p className="mt-2 text-sm text-slate-600">Average Placement</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white" aria-labelledby="why-heading">
          <div className="mx-auto max-w-7xl px-5 py-8 lg:py-10">
            <div className="border-t-2 border-[#c2410c] pt-6">
              <p className="text-xs font-semibold tracking-wide text-[#c2410c]">WHY SKILLMITRA</p>
            <h2 id="why-heading" className="mt-2 font-serif text-3xl font-semibold text-[#123b68]">
              From Labour Market Signals to Training Decisions
            </h2>
            <p className="mt-3 max-w-3xl leading-7 text-slate-600">
              Skill-development programmes may be designed using broad or historical occupation
              categories that do not fully reflect changing technologies, local industry demand or
              district-level requirements. SkillMitra provides a continuous, evidence-based mechanism
              for translating labour-market signals into training decisions.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <WhyCard
                title="Changing Industry Demand"
                text="Emerging technologies and changing production requirements create new skill needs."
              />
              <WhyCard
                title="Skill Mismatch"
                text="Existing training pathways may not match current employer requirements."
              />
              <WhyCard
                title="Training Capacity Gaps"
                text="Districts may have demand without sufficient seats, trainers, equipment or relevant courses."
              />
              <WhyCard
                title="Evidence-Based Planning"
                text="Government and training stakeholders need current evidence to decide what to train, where and at what scale."
              />
            </div>
          </div>
          </div>
        </section>

        <section id="demand" className="border-b border-slate-200 bg-[#eef3f8]" aria-labelledby="lmi-heading">
          <div className="mx-auto max-w-7xl px-5 py-8 lg:py-10">
            <div className="border-t-2 border-[#c2410c] pt-6">
              <p className="text-xs font-semibold tracking-wide text-[#c2410c]">02 LABOUR MARKET INTELLIGENCE</p>
              <h2 id="lmi-heading" className="mt-2 font-serif text-3xl font-semibold text-[#123b68]">
                Understand What Industry Needs
              </h2>
            </div>
            <p className="mt-3 max-w-3xl leading-7 text-slate-600">
              SkillMitra combines job-posting signals, employer surveys, industry consultations and placement outcomes to identify demand by role, skill, location and proficiency level.
            </p>
            <h3 className="mt-8 text-lg font-semibold text-[#123b68]">Evidence sources</h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                "Job Posting Signals",
                "Employer Surveys",
                "Industry Consultations",
                "Sector Growth Data",
                "Placement Outcomes",
                "Emerging Technology Trends",
              ].map((source) => (
                <li key={source} className="border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#123b68]">
                  {source}
                </li>
              ))}
            </ul>
            <h3 className="mt-8 text-lg font-semibold text-[#123b68]">Demand can be analysed by</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {["Job Role", "Skill", "District", "Industry Sector", "Proficiency Level", "Emerging Technology"].map(
                (item) => (
                  <li key={item} className="border border-[#123b68] bg-white px-3 py-1.5 text-sm font-medium text-[#123b68]">
                    {item}
                  </li>
                ),
              )}
            </ul>
            {statewideDemandSectors.length > 0 ? (
              <div className="mt-8 border border-slate-200 bg-white p-5">
                <h3 className="text-base font-semibold text-[#123b68]">
                  Industry sectors with published demand records
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Sector names are taken from current demand records. Scores are not shown on this
                  public page.
                </p>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {statewideDemandSectors.slice(0, 9).map((name) => (
                    <li key={name} className="text-sm text-slate-700">
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
            ) : sectors.length > 0 ? (
              <div className="mt-8 border border-slate-200 bg-white p-5">
                <h3 className="text-base font-semibold text-[#123b68]">Industry sectors currently in the platform</h3>
                <p className="mt-1 text-sm text-slate-600">Names are loaded from the existing industry API.</p>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {sectors.slice(0, 9).map((sector) => (
                    <li key={sector.id} className="text-sm text-slate-700">
                      {sector.name}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-6 text-sm text-slate-600">
                Live sector records will appear here when they are available in the platform database.
              </p>
            )}
            <a href="#planning" className="mt-6 inline-block font-semibold text-[#123b68]">
              Explore Industry Demand →
            </a>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-[#eef3f8]" aria-labelledby="engine-heading">
          <div className="mx-auto max-w-7xl px-5 py-8 lg:py-10">
            <div className="border-t-2 border-[#c2410c] pt-6">
              <p className="text-xs font-semibold tracking-wide text-[#c2410c]">{SECTION_INDEX.engine || "03"} CORE ENGINE</p>
              <h2 id="engine-heading" className="mt-2 font-serif text-3xl font-semibold text-[#123b68]">
                From Evidence to Training and Planning Decisions
              </h2>
            </div>
            <p className="mt-3 max-w-3xl leading-7 text-slate-600">
              SkillMitra translates labour-market evidence into curriculum, capacity, validation and district planning decisions.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2">
              {ENGINE_STEPS.map((step, index) => (
                <span key={step} className="flex items-center gap-x-3">
                  <span className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center bg-[#123b68] text-xs font-bold text-white">{index + 1}</span>
                    <span className="text-sm font-semibold text-[#123b68] whitespace-nowrap">{step}</span>
                  </span>
                  {index < ENGINE_STEPS.length - 1 ? <ChevronRight className="hidden h-4 w-4 text-slate-400 sm:inline" aria-hidden="true" /> : null}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section id="curriculum" className="border-b border-slate-200 bg-[#f3f7fb]" aria-labelledby="curriculum-heading">
          <div className="mx-auto max-w-7xl px-5 py-8 lg:py-10">
            <div className="border-t-2 border-[#c2410c] pt-6">
              <p className="text-xs font-semibold tracking-wide text-[#c2410c]">{SECTION_INDEX.curriculum || "04"} CURRICULUM ALIGNMENT</p>
              <h2 id="curriculum-heading" className="mt-2 font-serif text-3xl font-semibold text-[#123b68]">
                Keep Training Aligned with Industry
              </h2>
            </div>
            <p className="mt-3 max-w-3xl leading-7 text-slate-600">
              Course alignment ensures training content matches employer requirements and current skill demand.
            </p>
            <ol className="mt-8 flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center">
              {[
                "Industry Requirement",
                "Required Skills",
                "Current Course",
                "Skill/Curriculum Gap",
                "Recommended Update",
              ].map((step, index) => (
                <li key={step} className="flex items-center gap-2">
                  <span className="border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#123b68]">
                    {step}
                  </span>
                  {index < 4 ? (
                    <span className="hidden text-slate-400 md:inline" aria-hidden>
                      →
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
            <ul className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {[
                "Identify curriculum gaps",
                "Identify outdated course content",
                "Identify oversupplied courses",
                "Map skills to qualifications",
                "Recommend course updates",
                "Compare employer requirements with training outcomes",
              ].map((item) => (
                <li key={item} className="border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                  {item}
                </li>
              ))}
            </ul>
            <h3 className="mt-10 text-xl font-semibold text-[#123b68]">Courses currently listed</h3>
            {courses.length > 0 ? (
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {courses.slice(0, 6).map((course) => (
                  <article key={course.id} className="border border-slate-200 bg-white p-5">
                    <h4 className="text-lg font-semibold text-[#123b68]">{course.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {course.description || "Course details are available in the training catalogue."}
                    </p>
                    {course.status ? (
                      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status: {course.status}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-600">
                Course records will display here when they are published in the platform catalogue.
              </p>
            )}
          </div>
        </section>

        <section id="capacity" className="border-b border-slate-200 bg-white" aria-labelledby="capacity-heading">
          <div className="mx-auto max-w-7xl px-5 py-8 lg:py-10">
            <div className="border-t-2 border-[#c2410c] pt-6">
              <p className="text-xs font-semibold tracking-wide text-[#c2410c]">{SECTION_INDEX.capacity || "05"} TRAINING CAPACITY</p>
              <h2 id="capacity-heading" className="mt-2 font-serif text-3xl font-semibold text-[#123b68]">
                Is Training Capacity Available Where Demand Exists?
              </h2>
            </div>
            <p className="mt-3 max-w-3xl leading-7 text-slate-600">
              Training readiness is assessed by comparing district demand with available courses, seats, trainers and equipment.
            </p>
            <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-[#123b68]">
              District Demand + Available Courses + Training Seats + Trainer Capacity + Equipment =
              Training Readiness
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <MetricCard
                label="Districts in geography master"
                value={dataStatus === "loading" ? "Loading..." : districts.length > 0 ? String(districts.length) : "Live platform data is temporarily unavailable"}
              />
              <MetricCard
                label="Courses listed"
                value={dataStatus === "loading" ? "Loading..." : courseTotal !== null ? (courseTotal > 0 ? String(courseTotal) : "0 courses currently listed") : "Live platform data is temporarily unavailable"}
              />
              <MetricCard
                label="Labour-market opening records"
                value={dataStatus === "loading" ? "Loading..." : jobTotal !== null ? (jobTotal > 0 ? String(jobTotal) : "0 opening records currently listed") : "Live platform data is temporarily unavailable"}
              />
            </div>
            {process.env.NEXT_PUBLIC_DEMO_MODE === "true" && dataStatus === "ready" && (districts.length === 0 || courseTotal === null || jobTotal === null) ? (
              <p className="mt-4 text-xs text-slate-500">
                Demo mode: Illustrative data shown where live platform data is unavailable.
              </p>
            ) : null}
            <h3 className="mt-8 text-lg font-semibold text-[#123b68]">Planning decisions supported</h3>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[
                "Increase capacity",
                "Update course",
                "Develop trainer capability",
                "Improve equipment",
                "Redirect training",
                "Review low-demand course",
              ].map((item) => (
                <li key={item} className="border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm font-medium text-[#123b68]">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="employers" className="border-b border-slate-200 bg-[#eef3f8]" aria-labelledby="employer-heading">
          <div className="mx-auto max-w-7xl px-5 py-8 lg:py-10">
            <div className="border-t-2 border-[#c2410c] pt-6">
              <p className="text-xs font-semibold tracking-wide text-[#c2410c]">{SECTION_INDEX.employers || "06"} EMPLOYER VALIDATION</p>
              <h2 id="employer-heading" className="mt-2 font-serif text-3xl font-semibold text-[#123b68]">
                Validate Skills with Employers
              </h2>
            </div>
            <p className="mt-3 max-w-3xl leading-7 text-slate-600">
              Employer validation keeps training decisions connected to workplace standards and emerging workforce requirements.
            </p>
            <ol className="mt-8 flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center">
              {[
                "Employer Requirement",
                "Skill Requirement",
                "Course Alignment",
                "Candidate Readiness",
                "Placement Outcome",
              ].map((step, index) => (
                <li key={step} className="flex items-center gap-2">
                  <span className="border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#123b68]">
                    {step}
                  </span>
                  {index < 4 ? (
                    <span className="hidden text-slate-400 md:inline" aria-hidden>
                      →
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="planning" className="border-b border-slate-200 bg-white" aria-labelledby="district-heading">
          <div className="mx-auto max-w-7xl px-5 py-8 lg:py-10">
            <div className="border-t-2 border-[#c2410c] pt-6">
              <p className="text-xs font-semibold tracking-wide text-[#c2410c]">{SECTION_INDEX.planning || "07"} DISTRICT PLANNING</p>
              <h2 id="district-heading" className="mt-2 font-serif text-3xl font-semibold text-[#123b68]">
                Turn Statewide Intelligence into District Action
              </h2>
            </div>
            <p className="mt-3 max-w-3xl leading-7 text-slate-600">
              District-level demand guides course availability, training capacity and equipment planning.
            </p>
            <label htmlFor="district-select" className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Map className="h-4 w-4 text-[#c2410c]" aria-hidden="true" />
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
                {process.env.NEXT_PUBLIC_DEMO_MODE === "true" ? "Demo mode: Illustrative district data available below." : "Live district intelligence is temporarily unavailable."}
              </p>
            ) : null}

            <ol className="mt-8 grid gap-3 md:grid-cols-4 lg:grid-cols-7">
              {[
                "District",
                "Priority Industries",
                "High-Demand Roles",
                "Skill Gaps",
                "Existing Training Capacity",
                "Capacity Gap",
                "Recommended Training Action",
              ].map((step) => (
                <li key={step} className="border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-[#123b68]">
                  {step}
                </li>
              ))}
            </ol>

            {selectedDistrict ? (
              <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {districtError === "DEMO_MODE" && DEMO_DISTRICT_DATA[selectedDistrict] ? (
                  <>
                    <div className="col-span-full mb-4 border border-slate-300 bg-[#fff7ed] p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#c2410c]">
                        Illustrative district intelligence (demo mode - API unavailable)
                      </p>
                    </div>
                    <DemandList title="District" items={[selectedDistrictName || selectedDistrict]} />
                    <DemandList
                      title="Priority Industries"
                      items={DEMO_DISTRICT_DATA[selectedDistrict].industries}
                    />
                    <DemandList
                      title="High-Demand Roles"
                      items={DEMO_DISTRICT_DATA[selectedDistrict].roles}
                    />
                    <DemandList
                      title="Skill Gaps"
                      items={DEMO_DISTRICT_DATA[selectedDistrict].skills}
                    />
                    <DemandList
                      title="Existing Training Capacity"
                      items={[DEMO_DISTRICT_DATA[selectedDistrict].capacity]}
                    />
                    <DemandList
                      title="Capacity Gap"
                      items={[DEMO_DISTRICT_DATA[selectedDistrict].gap]}
                    />
                    <DemandList
                      title="Recommended Training Action"
                      items={[DEMO_DISTRICT_DATA[selectedDistrict].action]}
                    />
                  </>
                ) : (
                  <>
                    <DemandList title="District" items={[selectedDistrictName || selectedDistrict]} />
                    <DemandList
                      title="Priority Industries"
                      items={priorityIndustries}
                      empty="No industry demand records are currently published for this district."
                    />
                    <DemandList
                      title="High-Demand Roles"
                      items={
                        roleRecordCount
                          ? [`${roleRecordCount} job-role demand record${roleRecordCount === 1 ? "" : "s"} in current data`]
                          : []
                      }
                      empty="Role titles are held in authorised district intelligence views. No public role demand records are shown here unless present in the demand API."
                    />
                    <DemandList
                      title="Skill Gaps"
                      items={highDemandSkills}
                      empty="No skill demand records with catalogue names are currently available for this district."
                    />
                    <DemandList
                      title="Existing Training Capacity"
                      items={
                        localCourses.length
                          ? localCourses.map((course) => course.title)
                          : activeDistrictCourses.map((course) => course.course_title)
                      }
                      empty="No course coverage records are currently published for this district."
                    />
                    <DemandList
                      title="Capacity Gap"
                      items={capacityGapItems}
                      empty="Select a district to view the qualitative capacity-gap note from published records."
                    />
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
                  </>
                )}
              </div>
            ) : null}
            {districtLoading ? (
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <LineChart className="h-4 w-4 animate-pulse" aria-hidden="true" />
                Loading district intelligence…
              </p>
            ) : null}
            {districtError ? <p className="mt-4 text-sm text-red-800">{districtError}</p> : null}
          </div>
        </section>

        <section id="career" className="border-b border-slate-200 bg-white" aria-labelledby="career-heading">
          <div className="mx-auto max-w-7xl px-5 py-8 lg:py-10">
            <div className="border-t-2 border-[#c2410c] pt-6">
              <p className="text-xs font-semibold tracking-wide text-[#c2410c]">{SECTION_INDEX.career || "08"} CAREER PATHWAYS</p>
              <h2 id="career-heading" className="mt-2 font-serif text-3xl font-semibold text-[#123b68]">
                Help Candidates Understand the Path from Demand to Employment
              </h2>
            </div>
            <p className="mt-3 max-w-3xl leading-7 text-slate-600">
              Candidate guidance connects the same labour-market evidence used for government planning.
            </p>
            <ol className="mt-8 flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center">
              {[
                "Industry Demand",
                "Target Role",
                "Required Skills",
                "Current Skill Profile",
                "Skill Gap",
                "Recommended Course",
                "Job Opportunities",
              ].map((step, index) => (
                <li key={step} className="flex items-center gap-2">
                  <span className="border border-slate-300 bg-[#f8fafc] px-3 py-2 text-sm font-semibold text-[#123b68]">
                    {step}
                  </span>
                  {index < 6 ? (
                    <span className="hidden text-slate-400 lg:inline" aria-hidden>
                      →
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
            <div className="mt-8 border border-slate-200 bg-[#f1f7ff] p-6">
              <label htmlFor="career-sector" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Route className="h-4 w-4 text-[#c2410c]" aria-hidden="true" />
                Select an industry sector recorded in the platform
              </label>
              <select
                id="career-sector"
                value={recSector}
                onChange={(e) => { setRecSector(e.target.value); setRecRole(""); setRecResult(null); }}
                className="mt-2 w-full max-w-lg border border-slate-300 bg-white px-3 py-3"
              >
                <option value="">Select sector</option>
                {sectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.name}
                  </option>
                ))}
              </select>
              {recSector && recRoles.length > 0 && (
                <div className="mt-4">
                  <label htmlFor="career-role" className="block text-sm font-semibold text-slate-700">Select a target role</label>
                  <select
                    id="career-role"
                    value={recRole}
                    onChange={(e) => setRecRole(e.target.value)}
                    className="mt-2 w-full max-w-lg border border-slate-300 bg-white px-3 py-3"
                  >
                    <option value="">Select job role</option>
                    {recRoles.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
                  </select>
                </div>
              )}
              {recResult ? (
                <div className="mt-6 space-y-4">
                  <p className="text-sm leading-6 text-slate-700">
                    Pathway for <strong>{recResult.demand?.industry_sector_name || "selected sector"}</strong> → <strong>{recResult.demand?.job_role_title || "selected role"}</strong>:
                    industry demand → target role → required skills → current skill profile → skill gap → recommended course → job opportunities.
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="border border-slate-200 bg-white p-4 rounded-lg">
                      <p className="font-semibold text-[#123b68]">Required Skills</p>
                      {recResult.required_skills.length > 0 ? (
                        <ul className="mt-2 space-y-1 text-sm text-slate-700">
                          {recResult.required_skills.map((s) => <li key={s.id}>• {s.name}</li>)}
                        </ul>
                      ) : <p className="text-sm text-slate-600">No skills recorded.</p>}
                    </div>
                    <div className="border border-slate-200 bg-white p-4 rounded-lg">
                      <p className="font-semibold text-[#123b68]">Your Current Skills</p>
                      {recResult.candidate_skills.length > 0 ? (
                        <ul className="mt-2 space-y-1 text-sm text-slate-700">
                          {recResult.candidate_skills.map((s) => <li key={s.id}>• {s.name}</li>)}
                        </ul>
                      ) : (
                        <p className="text-sm text-slate-600">{recResult.candidate_authenticated ? "No candidate skills available yet." : "Login to compare your skills with this role."}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="border border-slate-200 bg-white p-4 rounded-lg">
                      <p className="font-semibold text-[#123b68]">Skill Gap</p>
                      {recResult.missing_skills.length > 0 ? (
                        <ul className="mt-2 space-y-1 text-sm text-slate-700">
                          {recResult.missing_skills.map((s) => <li key={s.id}>• {s.name}</li>)}
                        </ul>
                      ) : <p className="text-sm text-slate-600">Your current skills cover all listed requirements.</p>}
                    </div>
                    <div className="border border-slate-200 bg-white p-4 rounded-lg">
                      <p className="font-semibold text-[#123b68]">Skill Match</p>
                      <p className="mt-2 text-2xl font-bold text-[#123b68]">{recResult.skill_match_percentage.toFixed(0)}%</p>
                      <p className="text-sm text-slate-600">{recResult.matched_skill_count} / {recResult.total_required_skills} skills matched</p>
                    </div>
                  </div>
                  <div className="border border-slate-200 bg-white p-4 rounded-lg">
                    <p className="font-semibold text-[#123b68]">Recommended Course</p>
                    {recResult.recommended_courses.length > 0 ? (
                      <ul className="mt-2 space-y-2 text-sm text-slate-700">
                        {recResult.recommended_courses.map((c) => (
                          <li key={c.id}><span className="font-semibold">{c.title}</span> — {c.why}</li>
                        ))}
                      </ul>
                    ) : <p className="text-sm text-slate-600">No matching course currently available.</p>}
                  </div>
                  <div className="border border-slate-200 bg-white p-4 rounded-lg">
                    <p className="font-semibold text-[#123b68]">Job Opportunities</p>
                    <p className="mt-2 text-sm text-slate-600">Relevant postings: {recResult.demand?.relevant_job_postings_count ?? 0}</p>
                  </div>
                </div>
              ) : recSector && recRoles.length === 0 ? (
                <p className="mt-4 text-sm text-slate-600">No job roles found for this sector.</p>
              ) : null}
            </div>
          </div>
        </section>

        <section id="gaps" className="border-b border-slate-200 bg-[#eef3f8]" aria-labelledby="gaps-heading">
          <div className="mx-auto max-w-7xl px-5 py-8 lg:py-10">
            <div className="border-t-2 border-[#c2410c] pt-6">
              <p className="text-xs font-semibold tracking-wide text-[#c2410c]">{SECTION_INDEX.gaps || "09"} SKILL GAPS</p>
              <h2 id="gaps-heading" className="mt-2 font-serif text-3xl font-semibold text-[#123b68]">
                Compare Required Skills with Current Training and Candidate Profiles
              </h2>
            </div>
            <p className="mt-3 max-w-3xl leading-7 text-slate-600">
              Skill-gap analysis compares employer requirements with course coverage and candidate profiles.
            </p>
            {skills.length > 0 ? (
              <ul className="mt-6 flex flex-wrap gap-2">
                {skills.slice(0, 18).map((skill) => (
                  <li key={skill.id} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                    {skill.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate-600">Skill catalogue records will appear when available.</p>
            )}
          </div>
        </section>

        <section id="outcomes" className="border-b border-slate-200 bg-white" aria-labelledby="outcomes-heading">
          <div className="mx-auto max-w-7xl px-5 py-8 lg:py-10">
            <div className="border-t-2 border-[#c2410c] pt-6">
              <p className="text-xs font-semibold tracking-wide text-[#c2410c]">{SECTION_INDEX.outcomes || "10"} PLACEMENT OUTCOMES</p>
              <h2 id="outcomes-heading" className="mt-2 font-serif text-3xl font-semibold text-[#123b68]">
                Measure Whether Training Leads to Employment
              </h2>
            </div>
            <p className="mt-3 max-w-3xl leading-7 text-slate-600">
              Placement analytics measure whether training leads to employment, available through authorised platform views.
            </p>
            <div className="mt-8 border border-slate-200 bg-white p-6">
              <p className="text-sm text-slate-600">
                Placement analytics will be displayed as validated outcome data becomes available.
              </p>
            </div>

            <h3 id="jobs" className="mt-10 text-xl font-semibold text-[#123b68]">
              Current job postings
            </h3>
            {diverseJobs.length > 0 ? (
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                 {diverseJobs.map((job) => (
                  <article key={job.id} className="border border-slate-200 bg-white p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Labour-market source</p>
                    <h4 className="mt-1 text-lg font-semibold text-[#123b68]">{job.title}</h4>
                    {job.employer_name && (
                      <p className="mt-2 text-sm text-slate-600">Employer: {job.employer_name}</p>
                    )}
                    <p className="mt-2 text-sm text-slate-600">Status: {job.status}</p>
                    {job.district_id && districtById[job.district_id] ? (
                      <p className="mt-1 text-sm text-slate-600">{districtById[job.district_id]}</p>
                    ) : null}
                    {job.job_posting_skills?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Required Skills</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {job.job_posting_skills.slice(0, 5).map((s) => (
                            <span key={s.skill_id} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700">
                              {s.skill?.name || s.skill_id}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-600">
                Openings will appear here when job postings exist in the employment module.
              </p>
            )}
          </div>
        </section>

        <section id="roles" className="border-b border-slate-200 bg-[#eef3f8]" aria-labelledby="roles-heading">
          <div className="mx-auto max-w-7xl px-5 py-8 lg:py-10">
            <div className="border-t-2 border-[#c2410c] pt-6">
              <p className="text-xs font-semibold tracking-wide text-[#c2410c]">{SECTION_INDEX.roles || "11"} EXPLORE SKILLMITRA</p>
              <h2 id="roles-heading" className="mt-2 font-serif text-3xl font-semibold text-[#123b68]">
                Explore SkillMitra
              </h2>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <RoleCard
                title="Government & District Planners"
                text="Identify demand, capacity gaps and district training priorities."
                href="#planning"
              />
              <RoleCard
                title="Training Providers"
                text="Align courses, trainers and equipment with industry requirements."
                href="#curriculum"
              />
              <RoleCard
                title="Employers"
                text="Validate skills and communicate emerging workforce requirements."
                href="#employers"
              />
              <RoleCard
                title="Candidates"
                text="Understand career pathways, skill gaps and relevant training."
                href="#career"
              />
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-[#f8fafc]" aria-labelledby="leadership-heading">
          <div className="mx-auto max-w-7xl px-5 py-8">
            <p className="text-xs font-semibold tracking-wide text-slate-500">INSTITUTIONAL LEADERSHIP</p>
            <h2 id="leadership-heading" className="mt-2 font-serif text-xl font-semibold text-[#123b68]">
              Government of Maharashtra
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              SkillMitra is an initiative of the Government of Maharashtra under the Skills, Employment, Entrepreneurship &amp; Innovation Department.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Chief Minister</p>
                <p className="mt-2 text-sm font-semibold text-[#123b68]">Shri Devendra Fadnavis</p>
                <p className="mt-1 text-xs text-slate-600">Hon&apos;ble Chief Minister, Maharashtra</p>
              </div>
              <div className="border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Deputy Chief Minister</p>
                <p className="mt-2 text-sm font-semibold text-[#123b68]">Shri Eknath Shinde</p>
                <p className="mt-1 text-xs text-slate-600">Hon&apos;ble Deputy Chief Minister, Maharashtra</p>
              </div>
              <div className="border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Deputy Chief Minister</p>
                <p className="mt-2 text-sm font-semibold text-[#123b68]">Smt. Sunetra Pawar</p>
                <p className="mt-1 text-xs text-slate-600">Hon&apos;ble Deputy Chief Minister, Maharashtra</p>
              </div>
              <div className="border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Minister</p>
                <p className="mt-2 text-sm font-semibold text-[#123b68]">Shri Mangal Prabhat Lodha</p>
                <p className="mt-1 text-xs text-slate-600">Minister for Skills, Employment, Entrepreneurship and Innovation</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="bg-[#071d38] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <BrandMark src="/maharashtra-gov-logo.png" alt="Government of Maharashtra" className="mb-4 h-12 w-auto" />
            <h3 className="text-lg font-semibold">Government</h3>
            <ul className="mt-4 space-y-2 text-sm text-blue-100">
              <li>Government of Maharashtra</li>
              <li>Skills, Employment, Entrepreneurship &amp; Innovation Department</li>
              <li>Maharashtra State Skill Development Society</li>
              <li><a href="https://www.mahaswayam.gov.in/" target="_blank" rel="noopener noreferrer" className="hover:text-white">Mahaswayam</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Platform</h3>
            <ul className="mt-4 space-y-2 text-sm text-blue-100">
              {NAV.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="hover:text-white">
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="#career" className="hover:text-white">
                  Career Pathways
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Citizen Services</h3>
            <div className="mt-4 space-y-2 text-sm">
              <Link href="/login" className="hover:text-white text-blue-100">Candidate Login</Link>
              <Link href="/login" className="hover:text-white text-blue-100">Training Provider</Link>
              <Link href="/login" className="hover:text-white text-blue-100">Employer</Link>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Support</h3>
            <ul className="mt-4 space-y-2 text-sm text-blue-100">
              <li><a href="#contact" className="hover:text-white">Contact</a></li>
              <li><a href="#support" className="hover:text-white">Support Ticket</a></li>
              <li><a href="#grievance" className="hover:text-white">Grievance</a></li>
              <li><a href="#accessibility" className="hover:text-white">Accessibility</a></li>
              <li><a href="#privacy" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#terms" className="hover:text-white">Terms &amp; Conditions</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/20">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 text-sm text-blue-100 md:flex-row md:justify-between">
            <p>
              © 2026 SkillMitra | Government of Maharashtra, Skills, Employment, Entrepreneurship &amp; Innovation Department
            </p>
            <p>
              Labour Market Intelligence and Skill Development Planning Platform
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function uniqueNames(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function BrandMark({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className="inline-flex h-10 items-center border border-slate-300 bg-white px-2 text-xs font-bold text-[#123b68]">
        {alt}
      </span>
    );
  }
  return (
    // Logos are static public assets; next/image is unnecessary for these marks.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={`object-contain ${className ?? ""}`} onError={() => setFailed(true)} />
  );
}

function WhyCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="border border-slate-200 bg-[#f8fafc] p-5">
      <h3 className="text-lg font-semibold text-[#123b68]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </article>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-slate-200 bg-[#f8fafc] p-5">
      <p className="text-2xl font-semibold text-[#123b68]">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{label}</p>
    </div>
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
    <article className="border border-slate-200 bg-white p-5">
      <h3 className="font-semibold text-[#123b68]">{title}</h3>
      {items.length ? (
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {items.slice(0, 6).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-600">{empty || "No records currently available."}</p>
      )}
    </article>
  );
}

function RoleCard({ title, text, href }: { title: string; text: string; href: string }) {
  return (
    <article className="border border-slate-200 bg-white p-5">
      <h3 className="text-lg font-semibold text-[#123b68]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
      <a href={href} className="mt-4 inline-block text-sm font-semibold text-[#123b68]">
        Open this section
      </a>
    </article>
  );
}
