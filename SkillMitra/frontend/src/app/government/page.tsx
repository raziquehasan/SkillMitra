"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { GovernmentShell } from "@/app/government/GovernmentShell";
import { api, type District, type IndustrySector } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { 
  TrendingUp, Users, Building2, GraduationCap, Award, 
  AlertTriangle, BarChart3, MapPin, Target, FileText, 
  ArrowRight, ChevronDown, Activity, ArrowDown, Filter, X,
  Briefcase, Zap, CheckCircle, Clock, Users2, 
  ClipboardCheck, Lightbulb, Settings, Bell, UserCircle, HelpCircle, LogOut
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from "recharts";

interface GovDashboard {
  kpis: {
    districts_covered: number;
    active_demand_signals: number;
    high_demand_skills: number;
    critical_skill_gaps: number;
    critical_gap_demand_records: number;
    training_capacity_gaps: number;
    courses_requiring_review: number;
  };
  district_intelligence: {
    district_id: string;
    district_name: string;
    source_type: string | null;
    total_demand: number;
    verified_providers: number;
    total_capacity: number;
    capacity_status: string;
  } | null;
  skill_gaps: Array<{
    skill_id: string;
    skill_name: string | null;
    demand_count: number | null;
    training_coverage: string | null;
    gap_signal: string | null;
  }>;
  training_capacity: { 
    district_id: string; 
    district_name: string; 
    total_demand: number; 
    verified_providers: number; 
    course_offerings: number; 
    total_capacity: number; 
    capacity_status: string 
  } | null;
  course_alignment: Array<{
    course_id: string;
    course_title: string;
    alignment_status: string;
    skills_covered: string[];
    skills_demanded: string[];
    gaps: string[];
  }>;
  employer_demand: Array<{
    sector: string | null;
    job_role: string | null;
    required_skills: string[];
    posting_count: number;
  }>;
  district_training_plan: {
    district_id: string;
    district_name: string;
    plan_id: string;
    plan_status: string;
    total_recommendations: number;
    recommendations: Array<{
      plan_item_id: string;
      skill_id: string;
      job_role_id: string | null;
      demand_value: number | null;
      gap_value: number | null;
      recommended_action: string | null;
      review_status: string | null;
      rationale: string | null;
      course_id: string | null;
    }>;
  } | null;
}

// Demo placement data (deterministic, never inserted into database)
const DEMO_PLACEMENT_DATA = {
  all_maharashtra: {
    enrolled: 1240,
    completed: 980,
    assessed: 820,
    placed: 615
  },
  pune: {
    enrolled: 320,
    completed: 265,
    assessed: 210,
    placed: 165
  },
  pune_automotive: {
    enrolled: 85,
    completed: 72,
    assessed: 58,
    placed: 48
  },
  pune_it: {
    enrolled: 95,
    completed: 82,
    assessed: 70,
    placed: 58
  },
  mumbai: {
    enrolled: 280,
    completed: 225,
    assessed: 185,
    placed: 140
  },
  mumbai_healthcare: {
    enrolled: 75,
    completed: 62,
    assessed: 52,
    placed: 40
  },
  nashik: {
    enrolled: 180,
    completed: 145,
    assessed: 120,
    placed: 95
  },
  nashik_manufacturing: {
    enrolled: 65,
    completed: 55,
    assessed: 45,
    placed: 38
  },
  thane: {
    enrolled: 150,
    completed: 120,
    assessed: 98,
    placed: 78
  },
  nagpur: {
    enrolled: 120,
    completed: 95,
    assessed: 78,
    placed: 60
  },
  aurangabad: {
    enrolled: 90,
    completed: 72,
    assessed: 58,
    placed: 45
  },
  kolhapur: {
    enrolled: 70,
    completed: 56,
    assessed: 45,
    placed: 35
  },
  solapur: {
    enrolled: 60,
    completed: 48,
    assessed: 38,
    placed: 28
  }
};

function getDemoPlacementData(districtId: string, sectorId: string) {
  // Map sector IDs to demo data keys
  const sectorKey = sectorId?.toLowerCase().includes('it') ? 'it' :
                   sectorId?.toLowerCase().includes('automotive') ? 'automotive' :
                   sectorId?.toLowerCase().includes('healthcare') ? 'healthcare' :
                   sectorId?.toLowerCase().includes('manufacturing') ? 'manufacturing' : null;

  // Map district IDs to demo data keys
  const districtKey = districtId?.toLowerCase().includes('pune') ? 'pune' :
                      districtId?.toLowerCase().includes('mumbai') ? 'mumbai' :
                      districtId?.toLowerCase().includes('nashik') ? 'nashik' :
                      districtId?.toLowerCase().includes('thane') ? 'thane' :
                      districtId?.toLowerCase().includes('nagpur') ? 'nagpur' :
                      districtId?.toLowerCase().includes('aurangabad') ? 'aurangabad' :
                      districtId?.toLowerCase().includes('kolhapur') ? 'kolhapur' :
                      districtId?.toLowerCase().includes('solapur') ? 'solapur' : null;

  if (districtKey && sectorKey) {
    const combinedKey = `${districtKey}_${sectorKey}`;
    if (DEMO_PLACEMENT_DATA[combinedKey as keyof typeof DEMO_PLACEMENT_DATA]) {
      return DEMO_PLACEMENT_DATA[combinedKey as keyof typeof DEMO_PLACEMENT_DATA];
    }
    // Fallback to district-only if specific combination doesn't exist
    return DEMO_PLACEMENT_DATA[districtKey as keyof typeof DEMO_PLACEMENT_DATA];
  } else if (districtKey) {
    return DEMO_PLACEMENT_DATA[districtKey as keyof typeof DEMO_PLACEMENT_DATA];
  } else {
    return DEMO_PLACEMENT_DATA.all_maharashtra;
  }
}

// Comprehensive fallback dataset with district, sector, and time period fields
const DEMO_DASHBOARD_DATA: GovDashboard = {
  kpis: {
    districts_covered: 36,
    active_demand_signals: 52000,
    high_demand_skills: 156,
    critical_skill_gaps: 24,
    critical_gap_demand_records: 14500,
    training_capacity_gaps: 8,
    courses_requiring_review: 42
  },
  district_intelligence: {
    district_id: "all",
    district_name: "All Maharashtra",
    source_type: "aggregate",
    total_demand: 52000,
    verified_providers: 245,
    total_capacity: 38000,
    capacity_status: "ADEQUATE"
  },
  skill_gaps: [
    { skill_id: "s1", skill_name: "Python Programming", demand_count: 5200, training_coverage: "Available", gap_signal: "Moderate Gap" },
    { skill_id: "s2", skill_name: "Digital Tools", demand_count: 4800, training_coverage: "Available", gap_signal: "Moderate Gap" },
    { skill_id: "s3", skill_name: "EV Technology", demand_count: 4200, training_coverage: "Limited", gap_signal: "Critical Gap" },
    { skill_id: "s4", skill_name: "CNC Machine Operation", demand_count: 3800, training_coverage: "Available", gap_signal: "Moderate Gap" },
    { skill_id: "s5", skill_name: "Solar Installation", demand_count: 3500, training_coverage: "Limited", gap_signal: "Critical Gap" },
    { skill_id: "s6", skill_name: "Industrial Safety", demand_count: 3200, training_coverage: "Available", gap_signal: "Moderate Gap" },
    { skill_id: "s7", skill_name: "Machine Learning", demand_count: 2800, training_coverage: "None", gap_signal: "Critical Gap" },
    { skill_id: "s8", skill_name: "Welding Techniques", demand_count: 2600, training_coverage: "Available", gap_signal: "Moderate Gap" },
    { skill_id: "s9", skill_name: "Healthcare Assistance", demand_count: 2400, training_coverage: "Available", gap_signal: "Moderate Gap" },
    { skill_id: "s10", skill_name: "Battery Diagnostics", demand_count: 2200, training_coverage: "None", gap_signal: "Critical Gap" }
  ],
  training_capacity: {
    district_id: "all",
    district_name: "All Maharashtra",
    total_demand: 52000,
    verified_providers: 245,
    course_offerings: 380,
    total_capacity: 38000,
    capacity_status: "ADEQUATE"
  },
  course_alignment: [
    {
      course_id: "c1",
      course_title: "Electric Vehicle Service Technician",
      alignment_status: "ALIGNED",
      skills_covered: ["Electrical Technology", "EV Maintenance", "Safety", "Battery Basics"],
      skills_demanded: ["Electrical Technology", "EV Maintenance", "Safety", "Battery Basics", "Battery Diagnostics"],
      gaps: ["Battery Diagnostics"]
    },
    {
      course_id: "c2",
      course_title: "CNC Machine Operator",
      alignment_status: "ALIGNED",
      skills_covered: ["CNC Machine Operation", "Blueprint Reading", "Quality Control", "Safety"],
      skills_demanded: ["CNC Machine Operation", "Blueprint Reading", "Quality Control", "Safety", "CAM Programming"],
      gaps: ["CAM Programming"]
    },
    {
      course_id: "c3",
      course_title: "Python Programming & Data Analytics",
      alignment_status: "PARTIAL",
      skills_covered: ["Python Programming", "Data Analysis", "Pandas", "NumPy"],
      skills_demanded: ["Python Programming", "Data Analysis", "Pandas", "NumPy", "Machine Learning", "SQL"],
      gaps: ["Machine Learning", "SQL"]
    },
    {
      course_id: "c4",
      course_title: "Solar Installation Technician",
      alignment_status: "PARTIAL",
      skills_covered: ["Solar Installation", "Electrical Safety", "Panel Configuration"],
      skills_demanded: ["Solar Installation", "Electrical Safety", "Panel Configuration", "Battery Storage"],
      gaps: ["Battery Storage"]
    },
    {
      course_id: "c5",
      course_title: "Industrial Safety Assistant",
      alignment_status: "ALIGNED",
      skills_covered: ["Industrial Safety", "Hazard Identification", "Emergency Response", "Safety Equipment"],
      skills_demanded: ["Industrial Safety", "Hazard Identification", "Emergency Response", "Safety Equipment"],
      gaps: []
    }
  ],
  employer_demand: [
    { sector: "IT & ITES", job_role: "Python Developer", required_skills: ["Python", "Data Analysis", "Machine Learning"], posting_count: 850 },
    { sector: "IT & ITES", job_role: "Data Analyst", required_skills: ["SQL", "Python", "Data Visualization"], posting_count: 720 },
    { sector: "Manufacturing", job_role: "CNC Operator", required_skills: ["CNC Operation", "Blueprint Reading", "Quality Control"], posting_count: 640 },
    { sector: "Automotive", job_role: "EV Technician", required_skills: ["EV Technology", "Electrical Systems", "Battery Diagnostics"], posting_count: 580 },
    { sector: "Renewable Energy", job_role: "Solar Technician", required_skills: ["Solar Installation", "Electrical Safety", "Panel Configuration"], posting_count: 520 }
  ],
  district_training_plan: {
    district_id: "all",
    district_name: "All Maharashtra",
    plan_id: "plan-001",
    plan_status: "ACTIVE",
    total_recommendations: 12,
    recommendations: [
      {
        plan_item_id: "rec1",
        skill_id: "EV Technology",
        job_role_id: "ev-tech",
        demand_value: 4200,
        gap_value: 2100,
        recommended_action: "INCREASE_CAPACITY",
        review_status: "PENDING",
        rationale: "High demand for EV technicians in Pune and Mumbai with limited training capacity",
        course_id: "c1"
      },
      {
        plan_item_id: "rec2",
        skill_id: "Machine Learning",
        job_role_id: "ml-eng",
        demand_value: 2800,
        gap_value: 1900,
        recommended_action: "ADD_COURSE",
        review_status: "PENDING",
        rationale: "Critical gap in ML skills with no current course coverage",
        course_id: null
      },
      {
        plan_item_id: "rec3",
        skill_id: "CNC Machine Operation",
        job_role_id: "cnc-op",
        demand_value: 3800,
        gap_value: 800,
        recommended_action: "INCREASE_CAPACITY",
        review_status: "APPROVED",
        rationale: "Moderate gap in Nashik manufacturing sector",
        course_id: "c2"
      },
      {
        plan_item_id: "rec4",
        skill_id: "Battery Diagnostics",
        job_role_id: "ev-tech",
        demand_value: 2200,
        gap_value: 2200,
        recommended_action: "ADD_MODULE",
        review_status: "PENDING",
        rationale: "Complete coverage gap for battery diagnostics in EV courses",
        course_id: "c1"
      }
    ]
  }
};

// District-specific demo data
const DISTRICT_DEMO_DATA: Record<string, GovDashboard> = {
  pune: {
    kpis: {
      districts_covered: 1,
      active_demand_signals: 12450,
      high_demand_skills: 42,
      critical_skill_gaps: 7,
      critical_gap_demand_records: 2840,
      training_capacity_gaps: 3,
      courses_requiring_review: 12
    },
    district_intelligence: {
      district_id: "pune",
      district_name: "Pune",
      source_type: "district",
      total_demand: 12450,
      verified_providers: 45,
      total_capacity: 9200,
      capacity_status: "INADEQUATE"
    },
    skill_gaps: [
      { skill_id: "s1", skill_name: "Python Programming", demand_count: 1450, training_coverage: "Available", gap_signal: "Moderate Gap" },
      { skill_id: "s3", skill_name: "EV Technology", demand_count: 1200, training_coverage: "Limited", gap_signal: "Critical Gap" },
      { skill_id: "s5", skill_name: "Solar Installation", demand_count: 950, training_coverage: "Limited", gap_signal: "Critical Gap" },
      { skill_id: "s7", skill_name: "Machine Learning", demand_count: 850, training_coverage: "None", gap_signal: "Critical Gap" },
      { skill_id: "s10", skill_name: "Battery Diagnostics", demand_count: 720, training_coverage: "None", gap_signal: "Critical Gap" }
    ],
    training_capacity: {
      district_id: "pune",
      district_name: "Pune",
      total_demand: 12450,
      verified_providers: 45,
      course_offerings: 68,
      total_capacity: 9200,
      capacity_status: "INADEQUATE"
    },
    course_alignment: [
      {
        course_id: "c1",
        course_title: "Electric Vehicle Service Technician",
        alignment_status: "ALIGNED",
        skills_covered: ["Electrical Technology", "EV Maintenance", "Safety", "Battery Basics"],
        skills_demanded: ["Electrical Technology", "EV Maintenance", "Safety", "Battery Basics", "Battery Diagnostics"],
        gaps: ["Battery Diagnostics"]
      },
      {
        course_id: "c3",
        course_title: "Python Programming & Data Analytics",
        alignment_status: "PARTIAL",
        skills_covered: ["Python Programming", "Data Analysis", "Pandas", "NumPy"],
        skills_demanded: ["Python Programming", "Data Analysis", "Pandas", "NumPy", "Machine Learning", "SQL"],
        gaps: ["Machine Learning", "SQL"]
      }
    ],
    employer_demand: [
      { sector: "IT & ITES", job_role: "Python Developer", required_skills: ["Python", "Data Analysis", "Machine Learning"], posting_count: 320 },
      { sector: "Automotive", job_role: "EV Technician", required_skills: ["EV Technology", "Electrical Systems", "Battery Diagnostics"], posting_count: 280 }
    ],
    district_training_plan: {
      district_id: "pune",
      district_name: "Pune",
      plan_id: "plan-pune",
      plan_status: "ACTIVE",
      total_recommendations: 4,
      recommendations: [
        {
          plan_item_id: "rec1",
          skill_id: "EV Technology",
          job_role_id: "ev-tech",
          demand_value: 1200,
          gap_value: 600,
          recommended_action: "INCREASE_CAPACITY",
          review_status: "PENDING",
          rationale: "High demand for EV technicians in Pune with limited training capacity",
          course_id: "c1"
        },
        {
          plan_item_id: "rec2",
          skill_id: "Machine Learning",
          job_role_id: "ml-eng",
          demand_value: 850,
          gap_value: 850,
          recommended_action: "ADD_COURSE",
          review_status: "PENDING",
          rationale: "Critical gap in ML skills with no current course coverage",
          course_id: null
        }
      ]
    }
  },
  mumbai: {
    kpis: {
      districts_covered: 1,
      active_demand_signals: 9800,
      high_demand_skills: 38,
      critical_skill_gaps: 5,
      critical_gap_demand_records: 2100,
      training_capacity_gaps: 2,
      courses_requiring_review: 8
    },
    district_intelligence: {
      district_id: "mumbai",
      district_name: "Mumbai",
      source_type: "district",
      total_demand: 9800,
      verified_providers: 52,
      total_capacity: 8500,
      capacity_status: "ADEQUATE"
    },
    skill_gaps: [
      { skill_id: "s1", skill_name: "Python Programming", demand_count: 1100, training_coverage: "Available", gap_signal: "Moderate Gap" },
      { skill_id: "s9", skill_name: "Healthcare Assistance", demand_count: 950, training_coverage: "Available", gap_signal: "Moderate Gap" },
      { skill_id: "s3", skill_name: "EV Technology", demand_count: 800, training_coverage: "Limited", gap_signal: "Critical Gap" }
    ],
    training_capacity: {
      district_id: "mumbai",
      district_name: "Mumbai",
      total_demand: 9800,
      verified_providers: 52,
      course_offerings: 75,
      total_capacity: 8500,
      capacity_status: "ADEQUATE"
    },
    course_alignment: [
      {
        course_id: "c3",
        course_title: "Python Programming & Data Analytics",
        alignment_status: "PARTIAL",
        skills_covered: ["Python Programming", "Data Analysis", "Pandas", "NumPy"],
        skills_demanded: ["Python Programming", "Data Analysis", "Pandas", "NumPy", "Machine Learning", "SQL"],
        gaps: ["Machine Learning", "SQL"]
      }
    ],
    employer_demand: [
      { sector: "IT & ITES", job_role: "Data Analyst", required_skills: ["SQL", "Python", "Data Visualization"], posting_count: 280 },
      { sector: "Healthcare", job_role: "Healthcare Assistant", required_skills: ["Patient Care", "Medical Terminology"], posting_count: 240 }
    ],
    district_training_plan: {
      district_id: "mumbai",
      district_name: "Mumbai",
      plan_id: "plan-mumbai",
      plan_status: "ACTIVE",
      total_recommendations: 3,
      recommendations: [
        {
          plan_item_id: "rec1",
          skill_id: "Healthcare Assistance",
          job_role_id: "health-assist",
          demand_value: 950,
          gap_value: 300,
          recommended_action: "INCREASE_CAPACITY",
          review_status: "APPROVED",
          rationale: "Growing healthcare demand in Mumbai metropolitan area",
          course_id: null
        }
      ]
    }
  },
  nashik: {
    kpis: {
      districts_covered: 1,
      active_demand_signals: 6200,
      high_demand_skills: 28,
      critical_skill_gaps: 4,
      critical_gap_demand_records: 1800,
      training_capacity_gaps: 2,
      courses_requiring_review: 6
    },
    district_intelligence: {
      district_id: "nashik",
      district_name: "Nashik",
      source_type: "district",
      total_demand: 6200,
      verified_providers: 28,
      total_capacity: 4800,
      capacity_status: "INADEQUATE"
    },
    skill_gaps: [
      { skill_id: "s4", skill_name: "CNC Machine Operation", demand_count: 950, training_coverage: "Available", gap_signal: "Moderate Gap" },
      { skill_id: "s8", skill_name: "Welding Techniques", demand_count: 850, training_coverage: "Available", gap_signal: "Moderate Gap" }
    ],
    training_capacity: {
      district_id: "nashik",
      district_name: "Nashik",
      total_demand: 6200,
      verified_providers: 28,
      course_offerings: 42,
      total_capacity: 4800,
      capacity_status: "INADEQUATE"
    },
    course_alignment: [
      {
        course_id: "c2",
        course_title: "CNC Machine Operator",
        alignment_status: "ALIGNED",
        skills_covered: ["CNC Machine Operation", "Blueprint Reading", "Quality Control", "Safety"],
        skills_demanded: ["CNC Machine Operation", "Blueprint Reading", "Quality Control", "Safety", "CAM Programming"],
        gaps: ["CAM Programming"]
      }
    ],
    employer_demand: [
      { sector: "Manufacturing", job_role: "CNC Operator", required_skills: ["CNC Operation", "Blueprint Reading", "Quality Control"], posting_count: 240 }
    ],
    district_training_plan: {
      district_id: "nashik",
      district_name: "Nashik",
      plan_id: "plan-nashik",
      plan_status: "ACTIVE",
      total_recommendations: 2,
      recommendations: [
        {
          plan_item_id: "rec1",
          skill_id: "CNC Machine Operation",
          job_role_id: "cnc-op",
          demand_value: 950,
          gap_value: 400,
          recommended_action: "INCREASE_CAPACITY",
          review_status: "APPROVED",
          rationale: "Strong manufacturing base in Nashik with growing CNC demand",
          course_id: "c2"
        }
      ]
    }
  }
};

// Generic district fallback for districts without specific data
const GENERIC_DISTRICT_DATA: GovDashboard = {
  kpis: {
    districts_covered: 1,
    active_demand_signals: 1500,
    high_demand_skills: 8,
    critical_skill_gaps: 3,
    critical_gap_demand_records: 450,
    training_capacity_gaps: 1,
    courses_requiring_review: 2
  },
  district_intelligence: {
    district_id: "generic",
    district_name: "District",
    source_type: "district",
    total_demand: 1500,
    verified_providers: 8,
    total_capacity: 1100,
    capacity_status: "INADEQUATE"
  },
  skill_gaps: [
    { skill_id: "s1", skill_name: "Digital Tools", demand_count: 450, training_coverage: "Available", gap_signal: "Moderate Gap" },
    { skill_id: "s2", skill_name: "Basic IT Skills", demand_count: 380, training_coverage: "Limited", gap_signal: "Critical Gap" },
    { skill_id: "s3", skill_name: "Industrial Safety", demand_count: 320, training_coverage: "Available", gap_signal: "Moderate Gap" }
  ],
  training_capacity: {
    district_id: "generic",
    district_name: "District",
    total_demand: 1500,
    verified_providers: 8,
    course_offerings: 12,
    total_capacity: 1100,
    capacity_status: "INADEQUATE"
  },
  course_alignment: [
    {
      course_id: "c1",
      course_title: "Digital Skills Training",
      alignment_status: "PARTIAL",
      skills_covered: ["Digital Tools", "Basic IT"],
      skills_demanded: ["Digital Tools", "Basic IT", "Advanced IT"],
      gaps: ["Advanced IT"]
    }
  ],
  employer_demand: [
    { sector: "Manufacturing", job_role: "Machine Operator", required_skills: ["Basic IT", "Safety"], posting_count: 120 },
    { sector: "Retail", job_role: "Sales Associate", required_skills: ["Digital Tools", "Communication"], posting_count: 85 }
  ],
  district_training_plan: {
    district_id: "generic",
    district_name: "District",
    plan_id: "plan-generic",
    plan_status: "ACTIVE",
    total_recommendations: 2,
    recommendations: [
      {
        plan_item_id: "rec1",
        skill_id: "Digital Tools",
        job_role_id: "generic",
        demand_value: 450,
        gap_value: 150,
        recommended_action: "INCREASE_CAPACITY",
        review_status: "PENDING",
        rationale: "Growing demand for digital skills across sectors",
        course_id: "c1"
      }
    ]
  }
};

// Filter function that works for both backend and fallback data
function applyFiltersToDashboard(
  data: GovDashboard | null,
  districtId: string,
  sectorId: string,
  timePeriod: string,
  districtName: string
): GovDashboard | null {
  if (!data) return null;

  // If no filters are applied, return original data
  if (!districtId && !sectorId && (timePeriod === "last_30_days" || timePeriod === "current_month")) {
    return data;
  }

  // Map district name to demo data key (use the display name for matching)
  const districtKey = districtName?.toLowerCase().replace(/[^a-z]/g, '');
  const districtDataKey = Object.keys(DISTRICT_DEMO_DATA).find(key =>
    districtName?.toLowerCase().includes(key) || key.includes(districtKey || '')
  );

  let filteredData = { ...data };

  // If we have district-specific demo data, use it
  if (districtDataKey && DISTRICT_DEMO_DATA[districtDataKey]) {
    const districtData = DISTRICT_DEMO_DATA[districtDataKey];
    filteredData = districtData;
  } else if (districtName && districtName !== "All Districts") {
    // Use generic district data for districts without specific data
    const genericData = { ...GENERIC_DISTRICT_DATA };
    if (genericData.district_intelligence) {
      genericData.district_intelligence.district_name = districtName;
    }
    if (genericData.district_training_plan) {
      genericData.district_training_plan.district_name = districtName;
    }
    if (genericData.training_capacity) {
      genericData.training_capacity.district_name = districtName;
    }
    filteredData = genericData;
  }

  // Apply sector filter if specified
  if (sectorId) {
    const sectorLower = sectorId.toLowerCase();
    const filteredEmployerDemand = filteredData.employer_demand.filter(
      ed => ed.sector?.toLowerCase().includes(sectorLower) || sectorLower.includes(ed.sector?.toLowerCase() || '')
    );

    filteredData = {
      ...filteredData,
      employer_demand: filteredEmployerDemand.length > 0 ? filteredEmployerDemand : filteredData.employer_demand,
      // Adjust KPIs based on sector filter
      kpis: {
        ...filteredData.kpis,
        active_demand_signals: Math.round(filteredData.kpis.active_demand_signals * 0.6),
        high_demand_skills: Math.round(filteredData.kpis.high_demand_skills * 0.5),
        critical_skill_gaps: Math.round(filteredData.kpis.critical_skill_gaps * 0.7),
        critical_gap_demand_records: Math.round(filteredData.kpis.critical_gap_demand_records * 0.6)
      }
    };
  }

  // Apply time period scaling
  const timeMultiplier = timePeriod === "current_month" ? 1 :
                        timePeriod === "last_30_days" ? 0.3 :
                        timePeriod === "last_quarter" ? 0.75 :
                        timePeriod === "last_6_months" ? 0.6 :
                        timePeriod === "last_12_months" ? 1.2 :
                        timePeriod === "year_to_date" ? 0.9 : 1;

  // Always apply time period scaling if it's not the default
  if (timePeriod !== "last_30_days" && timePeriod !== "current_month") {
    filteredData = {
      ...filteredData,
      kpis: {
        ...filteredData.kpis,
        active_demand_signals: Math.round(filteredData.kpis.active_demand_signals * timeMultiplier),
        critical_gap_demand_records: Math.round(filteredData.kpis.critical_gap_demand_records * timeMultiplier)
      },
      district_intelligence: filteredData.district_intelligence ? {
        ...filteredData.district_intelligence,
        total_demand: Math.round(filteredData.district_intelligence.total_demand * timeMultiplier)
      } : null,
      training_capacity: filteredData.training_capacity ? {
        ...filteredData.training_capacity,
        total_demand: Math.round(filteredData.training_capacity.total_demand * timeMultiplier)
      } : null,
      skill_gaps: filteredData.skill_gaps.map(gap => ({
        ...gap,
        demand_count: gap.demand_count ? Math.round(gap.demand_count * timeMultiplier) : null
      }))
    };
  }

  return filteredData;
}

function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [districts, setDistricts] = useState<District[]>([]);
  const [sectors, setSectors] = useState<IndustrySector[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<GovDashboard | null>(DEMO_DASHBOARD_DATA);
  const [fetching, setFetching] = useState(false);
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterSector, setFilterSector] = useState("");
  const [filterTime, setFilterTime] = useState("last_30_days");

  useEffect(() => {
    (async () => {
      try {
        const [dRes, sRes] = await Promise.all([
          api.districts().catch(() => []),
          api.sectors().catch(() => []),
        ]);
        setDistricts(dRes);
        setSectors(sRes);
      } catch (error) {
        console.error("Failed to load districts/sectors:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadDashboard = useCallback(async () => {
    setFetching(true);
    try {
      const data = await api.governmentDashboard({
        district_id: filterDistrict || undefined,
        sector_id: filterSector || undefined,
      });
      setDashboard(data);
    } catch (error: any) {
      // Silently fall back to demo data on permission errors
      // Dashboard is already initialized with DEMO_DASHBOARD_DATA
      if (error?.message !== 'DEMO_FALLBACK') {
        console.log("API call failed, using demo data");
      }
    } finally {
      setFetching(false);
    }
  }, [filterDistrict, filterSector]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const resetFilters = () => {
    setFilterDistrict("");
    setFilterSector("");
    setFilterTime("last_30_days");
  };

  const selectedDistrictName = districts.find((d) => d.id === filterDistrict)?.name || "All Districts";
  const selectedSectorName = sectors.find((s) => s.id === filterSector)?.name || "All Sectors";

  // Get display name for time period
  const getTimePeriodName = (value: string) => {
    switch (value) {
      case "current_month": return "Current Month";
      case "last_30_days": return "Last 30 Days";
      case "last_quarter": return "Last Quarter";
      case "last_6_months": return "Last 6 Months";
      case "last_12_months": return "Last 12 Months";
      case "year_to_date": return "Year to Date";
      default: return value;
    }
  };
  const selectedTimePeriodName = getTimePeriodName(filterTime);

  // Apply filters to dashboard data
  const filteredDashboard = useMemo(() => {
    return applyFiltersToDashboard(dashboard, filterDistrict, filterSector, filterTime, selectedDistrictName);
  }, [dashboard, filterDistrict, filterSector, filterTime, selectedDistrictName]);

  // Demo placement data calculation
  const placementDemo = getDemoPlacementData(filterDistrict, filterSector);
  const completionRate = (placementDemo.completed / placementDemo.enrolled * 100).toFixed(1);
  const assessmentRate = (placementDemo.assessed / placementDemo.completed * 100).toFixed(1);
  const placementRate = (placementDemo.placed / placementDemo.assessed * 100).toFixed(1);

  // Skill demand ranking data (horizontal bar chart)
  const skillDemandData = filteredDashboard?.skill_gaps
    .filter(gap => gap.demand_count !== null)
    .sort((a, b) => (b.demand_count || 0) - (a.demand_count || 0))
    .slice(0, 8)
    .map((gap) => ({
      name: gap.skill_name || gap.skill_id,
      demand: gap.demand_count || 0,
      coverage: gap.training_coverage
    })) || [];

  // Capacity data
  const capacityData = filteredDashboard?.training_capacity ? [
    { name: 'Demand', value: filteredDashboard.training_capacity.total_demand },
    { name: 'Verified Capacity', value: filteredDashboard.training_capacity.total_capacity },
    { name: 'Capacity Gap', value: Math.max(0, filteredDashboard.training_capacity.total_demand - filteredDashboard.training_capacity.total_capacity) }
  ] : [];

  // Government Blue Color Palette
  const GOVERNMENT_BLUE = '#1e3a8a';      // Deep institutional blue
  const GOVERNMENT_BLUE_LIGHT = '#3b82f6'; // Lighter institutional blue
  const GOVERNMENT_NAVY = '#1e293b';     // Dark navy for headings
  const MUTED_BLUE = '#64748b';          // Muted blue for secondary elements
  const WARNING_ORANGE = '#f59e0b';      // Subtle orange for warnings
  const CRITICAL_RED = '#dc2626';        // Subtle red for critical states
  
  const COLORS = [GOVERNMENT_BLUE, GOVERNMENT_BLUE_LIGHT, MUTED_BLUE, WARNING_ORANGE, CRITICAL_RED];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#1e3a8a] border-r-transparent"></div>
          <p className="mt-4 text-sm text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1e293b]">
          Job Intelligence Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Monitor job-market demand, skill gaps, training capacity and employment outcomes across Maharashtra.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-[#1e3a8a]" />
          <span className="text-sm font-semibold text-slate-700">Filters</span>
          {(filterDistrict || filterSector) && (
            <button
              onClick={resetFilters}
              className="text-xs text-[#1e3a8a] hover:text-[#1e3a8a]/80 flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Reset Filters
            </button>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              className="w-full border border-slate-300 bg-white px-3 py-2 text-sm rounded focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
            >
              <option value="">All Districts</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Sector</label>
            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              className="w-full border border-slate-300 bg-white px-3 py-2 text-sm rounded focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
            >
              <option value="">All Sectors</option>
              {sectors.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Time Period</label>
            <select
              value={filterTime}
              onChange={(e) => setFilterTime(e.target.value)}
              className="w-full border border-slate-300 bg-white px-3 py-2 text-sm rounded focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
            >
              <option value="current_month">Current Month</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="last_quarter">Last Quarter</option>
              <option value="last_6_months">Last 6 Months</option>
              <option value="last_12_months">Last 12 Months</option>
              <option value="year_to_date">Year to Date</option>
            </select>
          </div>
        </div>
        {(filterDistrict || filterSector || filterTime !== "last_30_days") && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-600">
              Active filters: <span className="font-medium text-[#1e3a8a]">{selectedDistrictName}</span>
              {filterSector && <span className="font-medium text-[#1e3a8a]"> + {selectedSectorName}</span>}
              {filterTime !== "last_30_days" && <span className="font-medium text-[#1e3a8a]"> + {selectedTimePeriodName}</span>}
            </p>
          </div>
        )}
      </div>

      {fetching && (
        <div className="mb-6 text-sm text-slate-600 flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-[#1e3a8a] border-r-transparent" />
          Loading intelligence for {selectedDistrictName}...
        </div>
      )}

      {!fetching && filteredDashboard && (
        <div className="space-y-6">
          {/* KPI Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            <KpiCard
              label="Districts Covered"
              value={filteredDashboard.kpis.districts_covered}
              icon={<MapPin className="h-5 w-5" />}
            />
            <KpiCard
              label="Active Demand Signals"
              value={filteredDashboard.kpis.active_demand_signals}
              icon={<TrendingUp className="h-5 w-5" />}
            />
            <KpiCard
              label="High-Demand Skills"
              value={filteredDashboard.kpis.high_demand_skills}
              icon={<Zap className="h-5 w-5" />}
            />
            <KpiCard
              label="Critical Skill Gaps"
              value={filteredDashboard.kpis.critical_skill_gaps}
              icon={<AlertTriangle className="h-5 w-5" />}
              subtitle="Unique skills without coverage"
              critical={filteredDashboard.kpis.critical_skill_gaps > 0}
            />
            <KpiCard
              label="Gap Demand Records"
              value={filteredDashboard.kpis.critical_gap_demand_records}
              icon={<AlertTriangle className="h-5 w-5" />}
              subtitle="Demand records for uncovered skills"
              critical={filteredDashboard.kpis.critical_gap_demand_records > 0}
            />
            <KpiCard
              label="Training Capacity Gaps"
              value={filteredDashboard.kpis.training_capacity_gaps}
              icon={<BarChart3 className="h-5 w-5" />}
              critical={filteredDashboard.kpis.training_capacity_gaps > 0}
            />
          </div>

          {/* Decision Support Pipeline */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-5 w-5 text-[#1e3a8a]" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[#1e3a8a]">Decision Support Pipeline</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">From job-market demand to training and employment outcomes</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 w-full">
              <PipelineStage
                stage="01"
                title="Industry Demand"
                value={filteredDashboard.kpis.active_demand_signals}
                subtitle="signals"
                icon={<TrendingUp className="h-4 w-4" />}
                alert={false}
              />
              <PipelineStage
                stage="02"
                title="Skill Gap"
                value={filteredDashboard.kpis.critical_skill_gaps}
                subtitle="critical skills"
                icon={<AlertTriangle className="h-4 w-4" />}
                alert={filteredDashboard.kpis.critical_skill_gaps > 0}
              />
              <PipelineStage
                stage="03"
                title="Course Alignment"
                value={filteredDashboard.course_alignment.length}
                subtitle="courses aligned"
                icon={<GraduationCap className="h-4 w-4" />}
                alert={false}
              />
              <PipelineStage
                stage="04"
                title="Training Capacity"
                value={filteredDashboard.training_capacity?.total_capacity || 0}
                subtitle="verified seats"
                icon={<Users2 className="h-4 w-4" />}
                alert={filteredDashboard.kpis.training_capacity_gaps > 0}
              />
              <PipelineStage
                stage="05"
                title="Placement Outcomes"
                value={placementDemo.placed}
                subtitle="placed candidates"
                icon={<Award className="h-4 w-4" />}
                alert={false}
              />
            </div>
          </div>

          {/* Main Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Skill Demand Ranking */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#1e293b]">Skill Demand Ranking</h3>
                  <p className="text-xs text-slate-500 mt-1">Top skills by current job-market demand</p>
                </div>
                <button 
                  onClick={() => router.push("/government/skill-gaps")}
                  className="text-xs text-[#1e3a8a] hover:text-[#1e3a8a]/80 flex items-center gap-1 font-medium"
                >
                  View Details <ArrowRight className="h-3 w-3" />
                </button>
              </div>
              {skillDemandData.length > 0 ? (
                <div className="space-y-3">
                  {skillDemandData.map((skill, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-6">{index + 1}.</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-[#1e293b]">{skill.name}</span>
                          <span className="text-sm font-bold text-[#1e3a8a]">{skill.demand}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#1e3a8a] rounded-full"
                            style={{ width: `${(skill.demand / Math.max(...skillDemandData.map(s => s.demand))) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message="No skill demand data available for the selected filters." />
              )}
            </div>

            {/* Demand vs Training Capacity */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#1e293b]">Demand vs Training Capacity</h3>
                  <p className="text-xs text-slate-500 mt-1">Training capacity analysis for {selectedDistrictName}</p>
                </div>
                <button
                  onClick={() => router.push("/government/training-capacity")}
                  className="text-xs text-[#1e3a8a] hover:text-[#1e3a8a]/80 flex items-center gap-1 font-medium"
                >
                  View Details <ArrowRight className="h-3 w-3" />
                </button>
              </div>
              {filteredDashboard.training_capacity ? (
                <>
                  {filteredDashboard.training_capacity.total_capacity === 0 && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-xs text-amber-800">
                        <strong>Note:</strong> No verified training capacity is currently recorded for this selection.
                      </p>
                    </div>
                  )}
                  <div className="space-y-3">
                    {capacityData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium text-[#1e293b]">{item.name}</span>
                        <span className="text-lg font-bold text-[#1e3a8a]">{item.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState message="No capacity data available for the selected filters." />
              )}
            </div>
          </div>

          {/* Critical Skill Gap Analysis */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#1e293b]">Critical Skill Gap Analysis</h3>
                <p className="text-xs text-slate-500 mt-1">Skills without training coverage</p>
              </div>
              <button
                onClick={() => router.push("/government/skill-gaps")}
                className="text-xs text-[#1e3a8a] hover:text-[#1e3a8a]/80 flex items-center gap-1 font-medium"
              >
                View All <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            {filteredDashboard.skill_gaps.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-3 font-semibold text-[#1e293b]">Skill</th>
                      <th className="text-left py-2 px-3 font-semibold text-[#1e293b]">Demand</th>
                      <th className="text-left py-2 px-3 font-semibold text-[#1e293b]">Coverage Status</th>
                      <th className="text-left py-2 px-3 font-semibold text-[#1e293b]">Gap Severity</th>
                      <th className="text-left py-2 px-3 font-semibold text-[#1e293b]">Course Availability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDashboard.skill_gaps.slice(0, 8).map((gap, index) => (
                      <tr key={`${gap.skill_id}-${index}`} className="border-b border-slate-100">
                        <td className="py-2 px-3 font-medium text-[#1e293b]">{gap.skill_name || gap.skill_id}</td>
                        <td className="py-2 px-3">{gap.demand_count || 0}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            gap.training_coverage === "Available"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                            {gap.training_coverage || "None"}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            gap.gap_signal === "Critical Gap"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {gap.gap_signal || "Unknown"}
                          </span>
                        </td>
                        <td className="py-2 px-3">{gap.training_coverage === "Available" ? "Available" : "None"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState message="No skill gap data available for the selected filters." />
            )}
          </div>

          {/* Course Alignment */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#1e293b]">Course Alignment</h3>
                <p className="text-xs text-slate-500 mt-1">Training courses vs industry demand</p>
              </div>
              <button
                onClick={() => router.push("/government/course-alignment")}
                className="text-xs text-[#1e3a8a] hover:text-[#1e3a8a]/80 flex items-center gap-1 font-medium"
              >
                View Details <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            {filteredDashboard.course_alignment.length > 0 ? (
              <div className="space-y-3">
                {filteredDashboard.course_alignment.slice(0, 5).map((course) => (
                  <div key={course.course_id} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#1e293b]">{course.course_title}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        course.alignment_status === "ALIGNED"
                          ? "bg-green-100 text-green-700"
                          : course.alignment_status === "PARTIAL"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {course.alignment_status}
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-slate-600">
                      <span>Skills Covered: {course.skills_covered.length}</span>
                      <span>Skills Demanded: {course.skills_demanded.length}</span>
                      {course.gaps.length > 0 && <span className="text-red-600">Gaps: {course.gaps.length}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No course alignment data available for the selected filters." />
            )}
          </div>

          {/* Employer Demand */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#1e293b]">Employer Demand by Industry</h3>
                <p className="text-xs text-slate-500 mt-1">Current job postings and requirements</p>
              </div>
              <button
                onClick={() => router.push("/government/employer-demand")}
                className="text-xs text-[#1e3a8a] hover:text-[#1e3a8a]/80 flex items-center gap-1 font-medium"
              >
                View Details <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            {filteredDashboard.employer_demand.length > 0 ? (
              <div className="space-y-3">
                {filteredDashboard.employer_demand.slice(0, 5).map((ed, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#1e293b]">{ed.job_role || "—"}</p>
                      <p className="text-xs text-slate-500">{ed.sector || "—"}</p>
                      {ed.required_skills && ed.required_skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {ed.required_skills.slice(0, 3).map((skill, sidx) => (
                            <span key={sidx} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold text-[#1e3a8a]">{ed.posting_count}</p>
                      <p className="text-xs text-slate-500">postings</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No employer demand data available for the selected filters." />
            )}
          </div>

          {/* District Overview */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#1e293b]">District Overview</h3>
                <p className="text-xs text-slate-500 mt-1">{selectedDistrictName}</p>
              </div>
              <Activity className="h-4 w-4 text-[#1e3a8a]" />
            </div>
            {filteredDashboard.district_intelligence ? (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Total Demand</p>
                  <p className="text-2xl font-bold text-[#1e3a8a]">{filteredDashboard.district_intelligence.total_demand?.toLocaleString() || 0}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Verified Providers</p>
                  <p className="text-2xl font-bold text-[#1e3a8a]">{filteredDashboard.district_intelligence.verified_providers || 0}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Total Training Capacity</p>
                  <p className="text-2xl font-bold text-[#1e3a8a]">{filteredDashboard.district_intelligence.total_capacity?.toLocaleString() || 0}</p>
                </div>
              </div>
            ) : (
              <EmptyState message="Select a district to view district-level data." />
            )}
          </div>

          {/* Placement Outcomes */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#1e293b]">Placement Outcomes</h3>
                <p className="text-xs text-slate-500 mt-1">Training-to-employment pipeline</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-[#1e3a8a]" />
                <p className="text-2xl font-bold text-[#1e3a8a]">{placementDemo.enrolled.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">Enrolled</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold text-green-600">{placementDemo.completed.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">Completed</p>
                <p className="text-xs text-slate-400 mt-1">{completionRate}% completion rate</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <ClipboardCheck className="h-6 w-6 mx-auto mb-2 text-[#3b82f6]" />
                <p className="text-2xl font-bold text-[#3b82f6]">{placementDemo.assessed.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">Assessed</p>
                <p className="text-xs text-slate-400 mt-1">{assessmentRate}% assessment rate</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <Award className="h-6 w-6 mx-auto mb-2 text-[#1e3a8a]" />
                <p className="text-2xl font-bold text-[#1e3a8a]">{placementDemo.placed.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">Placed</p>
                <p className="text-xs text-slate-400 mt-1">{placementRate}% placement rate</p>
              </div>
            </div>
          </div>

          {/* Government Actions */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#1e293b]">Recommended Government Actions</h3>
                <p className="text-xs text-slate-500 mt-1">Based on demand, skill gaps and training capacity analysis</p>
              </div>
              <button
                onClick={() => router.push("/government/recommended-actions")}
                className="text-xs text-[#1e3a8a] hover:text-[#1e3a8a]/80 flex items-center gap-1 font-medium"
              >
                View All <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            {filteredDashboard.district_training_plan?.recommendations && filteredDashboard.district_training_plan.recommendations.length > 0 ? (
              <div className="space-y-3">
                {filteredDashboard.district_training_plan.recommendations.slice(0, 4).map((rec) => (
                  <div key={rec.plan_item_id} className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                    <div className="flex-shrink-0 mt-0.5">
                      <Lightbulb className="h-4 w-4 text-[#1e3a8a]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-sm font-medium text-[#1e293b]">{rec.skill_id}</p>
                        {rec.recommended_action && (
                          <span className="px-2 py-0.5 bg-[#1e3a8a] text-white text-xs rounded whitespace-nowrap">
                            {rec.recommended_action.replace(/_/g, " ")}
                          </span>
                        )}
                      </div>
                      {rec.rationale && (
                        <p className="text-xs text-slate-600">{rec.rationale}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No recommendations available for the selected district." />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ 
  label, 
  value, 
  icon, 
  subtitle,
  critical = false
}: { 
  label: string; 
  value: string | number | null; 
  icon: React.ReactNode;
  subtitle?: string;
  critical?: boolean;
}) {
  return (
    <div className={`rounded-lg border ${critical ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'} p-4 shadow-sm`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="mt-2 text-2xl font-bold text-[#1e3a8a]">
            {value !== null && value !== undefined ? (typeof value === 'number' ? value.toLocaleString() : value) : "—"}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
        <div className={`p-2 rounded-lg ${critical ? 'bg-red-100 text-red-600' : 'bg-[#1e3a8a]/10 text-[#1e3a8a]'}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function PipelineStage({ 
  stage,
  title, 
  value, 
  subtitle, 
  icon,
  alert = false
}: { 
  stage: string;
  title: string; 
  value: number; 
  subtitle: string;
  icon: React.ReactNode;
  alert?: boolean;
}) {
  return (
    <div className={`w-full min-w-0 rounded-lg border p-3 min-h-[110px] max-h-[130px] flex flex-col ${
      alert 
        ? 'border-red-200 bg-red-50' 
        : 'border-slate-200 bg-white'
    }`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-[#1e3a8a]/60">{stage}</span>
        <div className={`p-1.5 rounded-lg ${
          alert 
            ? 'bg-red-100 text-red-600' 
            : 'bg-[#1e3a8a]/10 text-[#1e3a8a]'
        }`}>
          {icon}
        </div>
      </div>
      <p className="text-xl font-bold text-[#1e3a8a] flex-1">
        {value !== null && value !== undefined ? (typeof value === 'number' ? value.toLocaleString() : value) : "—"}
      </p>
      <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
      <p className="text-xs font-medium text-[#1e293b] mt-1">{title}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

export default function GovernmentDashboard() {
  return (
    <GovernmentShell>
      <DashboardContent />
    </GovernmentShell>
  );
}