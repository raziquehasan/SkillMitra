function getApiBase(): string {
  if (typeof window === 'undefined') {
    // Server-side (inside Docker)
    return process.env.INTERNAL_API_URL || "http://backend:8080";
  }
  // Client-side (browser) - use the same URL as server for Docker environment
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
}

console.log('API_BASE:', getApiBase(), 'Environment:', {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  INTERNAL_API_URL: process.env.INTERNAL_API_URL,
  isServer: typeof window === 'undefined'
});

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
};

export type District = {
  id: string; // UUID from backend
  name: string;
  code: string | null;
  state_code: string | null;
};

export type IndustrySector = {
  id: string; // UUID from backend
  name: string;
  code: string | null;
  description: string | null;
};

export type Skill = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
};

export type JobRole = {
  id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  industry_sector_id: string | null;
};

export type Course = {
  id: string;
  title: string;
  description: string | null;
  district_id: string | null;
  status: string | null;
  delivery_mode: string | null;
  course_url: string | null;
  provider_url: string | null;
  duration_hours: number | null;
  training_level: string | null;
};

export type HomepageCourse = {
  id: string;
  title: string;
  demandLevel: string;
  district: string | null;
  skills: string[];
  durationHours: number | null;
  courseUrl: string | null;
  providerUrl: string | null;
  providerName: string | null;
  relatedProgrammeName: string | null;  // Name of related programme if isRelatedProgramme is true
  isRelatedProgramme?: boolean;  // True if this is a related pathway, not direct provider
  isListingUrl?: boolean;  // True if URL is a listing page, not course-specific
};

export type JobPosting = {
  id: string;
  title: string;
  status: string;
  posted_date: string | null;
  district_id: string | null;
  employer_id: string;
  job_role_id: string;
  company_name: string | null;
  district_name: string | null;
  job_role_title: string | null;
  skills: Array<string | { skill: { id: string; name: string; category: { id: string; name: string } | null } | null }>;
  employer_website: string | null;
  employer_name: string | null;
  job_url: string | null;
  employer_careers_url: string | null;
  is_verified: boolean;
  job_posting_skills: Array<{
    skill_id: string;
    proficiency_level_id: string | null;
    importance: string | null;
    skill: { id: string; name: string; category: { id: string; name: string } | null } | null;
  }>;
  employment_type?: string;
  skill_match_score?: number;
  salary_range?: string;
  required_skills?: string[];
};

export type IndustryDemand = {
  id: string;
  industry_sector_id: string;
  job_role_id: string | null;
  skill_id: string | null;
  district_id: string | null;
  aggregate_demand_score: number | null;
};

export type AuthUser = {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  roles: string[];
};

export type CourseAlignmentData = {
  course_id: string;
  course_title: string;
  provider: string;
  sector: string;
  district_id: string | null;
  district_name: string | null;
  alignment_status: "ALIGNED" | "PARTIAL" | "NEEDS_REVIEW";
  skills_covered: string[];
  skills_demanded: string[];
  gaps: string[];
  coverage_percentage: number;
  priority: "High" | "Medium" | "Low";
};

export type SkillCoverage = {
  skill_name: string;
  demand: number;
  coverage: number;
  gap: number;
};

export type DistrictAlignmentSummary = {
  district_id: string;
  district_name: string;
  total_courses: number;
  strong_alignment: number;
  partial: number;
  needs_review: number;
  average_alignment: number;
};

function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = sessionStorage.getItem("skillmitra_access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${getApiBase()}${path}`;
  console.log(`API Request: ${url}`, init);
  
  // Don't set Content-Type for FormData - let browser set it with boundary
  const isFormData = init?.body instanceof FormData;
  
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...authHeaders(),
      ...(init?.headers ?? {}),
    },
  });
  
  console.log(`API Response: ${response.status} ${response.statusText}`);
  
  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      console.log('Error response body:', body);
      if (typeof body?.detail === "string") detail = body.detail;
      else if (Array.isArray(body?.detail)) detail = body.detail[0]?.msg ?? detail;
    } catch (e) {
      console.log('Failed to parse error response:', e);
      /* keep default */
    }
    // Don't throw error for government dashboard permission issues
    // This allows the dashboard to fall back to demo data silently
    if (path.includes('/government/dashboard') && response.status === 403) {
      throw new Error('DEMO_FALLBACK');
    }
    // Don't log auth errors to console to avoid noise during normal auth flow
    if (path.includes('/auth/me') && response.status === 401) {
      // Silent fail for auth check - expected when no valid token
      throw new Error(detail);
    }
    throw new Error(detail);
  }
  
  const data = await response.json() as Promise<T>;
  console.log('API Response data:', data);
  return data;
}

export const api = {
  districts: () => apiFetch<District[]>("/api/v1/geography/districts"),
  sectors: () => apiFetch<IndustrySector[]>("/api/v1/industry/sectors"),
  skills: () => apiFetch<Paginated<Skill>>("/api/v1/skills?page=1&page_size=100"),

  proficiencyLevels: () => apiFetch<{
    id: string;
    name: string;
    description: string | null;
    rank_score: number;
  }[]>("/api/v1/skills/proficiency-levels"),

  courses: () => apiFetch<Paginated<Course>>("/api/v1/courses?page=1&page_size=12"),
  homepageCourses: () => apiFetch<HomepageCourse[]>("/api/v1/courses/homepage"),
  jobs: (params?: { district_id?: string; search?: string }) => {
    const qs = new URLSearchParams();
    qs.set("page", "1");
    qs.set("page_size", "50"); // Increased to show more jobs
    if (params?.district_id) qs.set("district_id", params.district_id);
    if (params?.search) qs.set("search", params.search);
    return apiFetch<Paginated<JobPosting>>(`/api/v1/jobs?${qs.toString()}`);
  },
  
  jobById: (jobId: string) => apiFetch<JobPosting>(`/api/v1/jobs/${jobId}`),
  
  jobRelatedCourses: (jobId: string) => apiFetch<any[]>(`/api/v1/jobs/${jobId}/related-courses`),
  
  applyToJob: (data: { job_posting_id: string }) => 
    apiFetch<any>("/api/v1/applications", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  demandIndustries: () =>
    apiFetch<IndustryDemand[]>("/api/v1/demand/industries?page=1&page_size=50"),
  demandByDistrict: (districtId: string) =>
    apiFetch<IndustryDemand[]>(
      `/api/v1/demand/districts?district_id=${encodeURIComponent(districtId)}&page=1&page_size=100`,
    ),
  demandCourses: (districtId: string) =>
    apiFetch<{ course_id: string; course_title: string; coverage_status: string }[]>(
      `/api/v1/demand/courses?district_id=${encodeURIComponent(districtId)}&page=1&page_size=20`,
    ),
  jobRoles: (sectorId?: string, districtId?: string) => {
    const params = new URLSearchParams();
    if (sectorId) params.set("industry_sector_id", sectorId);
    if (districtId) params.set("district_id", districtId);
    const queryString = params.toString();
    return apiFetch<JobRole[]>(
      `/api/v1/industry/job-roles${queryString ? `?${queryString}` : ""}`,
    );
  },

  allJobRoles: () => apiFetch<JobRole[]>("/api/v1/job-roles"),
  industryDemand: (params?: {
    industry_sector_id?: string;
    district_id?: string;
    job_role_id?: string;
    skill_id?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.industry_sector_id) qs.set("industry_sector_id", params.industry_sector_id);
    if (params?.district_id) qs.set("district_id", params.district_id);
    if (params?.job_role_id) qs.set("job_role_id", params.job_role_id);
    if (params?.skill_id) qs.set("skill_id", params.skill_id);
    qs.set("page", "1");
    qs.set("page_size", "50");
    return apiFetch<IndustryDemand[]>(
      `/api/v1/demand/industries?${qs.toString()}`,
    );
  },
  careerRecommendation: (params: {
    district_id?: string;
    industry_sector_id?: string;
    job_role_id: string;
  }) => {
    const qs = new URLSearchParams();
    if (params.district_id) qs.set("district_id", params.district_id);
    if (params.industry_sector_id) qs.set("industry_sector_id", params.industry_sector_id);
    qs.set("job_role_id", params.job_role_id);
    return apiFetch<{
      demand: {
        district_id: string | null;
        district_name: string | null;
        industry_sector_id: string | null;
        industry_sector_name: string | null;
        job_role_id: string | null;
        job_role_title: string | null;
        demand_score: number | null;
        demand_signals_count: number;
        relevant_job_postings_count: number;
        demand_trend: string | null;
      } | null;
      required_skills: Array<{ id: string; name: string; description: string | null }>;
      candidate_skills: Array<{ id: string; name: string; description: string | null }>;
      skill_match_percentage: number;
      matched_skill_count: number;
      total_required_skills: number;
      missing_skills: Array<{ id: string; name: string; description: string | null }>;
      recommended_courses: Array<{
        id: string | null;
        title: string;
        description: string | null;
        covers: string[];
        why: string;
        addresses_missing: string;
        covers_details: string;
      }>;
      job_readiness_percentage: number;
      candidate_authenticated: boolean;
      message: string | null;
    }>(`/api/v1/career-guidance/recommendation?${qs.toString()}`);
  },
  careerExplorer: (industry_sector_id: string) => {
    const qs = new URLSearchParams();
    qs.set("industry_sector_id", industry_sector_id);
    return apiFetch<{
      sector_name: string | null;
      career_paths: Array<{
        job_role_id: string;
        job_role_title: string;
        required_skill_ids: string[];
        demand_signal_count: number;
        relevant_course_count: number;
        open_job_postings_count: number;
        demand_trend: string | null;
        reasons: string[];
      }>;
      message: string | null;
    }>(`/api/v1/career-guidance/career-explorer?${qs.toString()}`);
  },
  // Auth endpoints
  me: () => apiFetch<AuthUser>("/api/v1/auth/me"),
  login: (email: string, password: string) =>
    apiFetch<{ user: AuthUser; access_token: string; expires_in: number }>(
      "/api/v1/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) },
    ),
  logout: () =>
    apiFetch<{ message: string }>(
      "/api/v1/auth/logout",
      { method: "POST" },
    ),
  refresh: () =>
    apiFetch<{ user: AuthUser; access_token: string; expires_in: number }>(
      "/api/v1/auth/refresh",
      { method: "POST" },
    ),
  forgotPassword: (email: string) =>
    apiFetch<{ message: string }>(
      "/api/v1/auth/forgot-password",
      { method: "POST", body: JSON.stringify({ email }) },
    ),
  resetPassword: (token: string, newPassword: string) =>
    apiFetch<{ message: string }>(
      "/api/v1/auth/reset-password",
      { method: "POST", body: JSON.stringify({ token, new_password: newPassword }) },
    ),
  // Registration endpoints
  registerCandidate: (payload: {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
    gender?: string;
    date_of_birth?: string;
    district_id?: string;
    education_level?: string;
    stream_specialization?: string;
    skip_resume_upload?: boolean;
  }) =>
    apiFetch<{ user: AuthUser; message: string }>(
      "/api/v1/auth/register/candidate",
      { method: "POST", body: JSON.stringify({ ...payload, role: "candidate" }) },
    ),
  registerEmployer: (payload: {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
    company_name: string;
    contact_person?: string;
    industry_sector_id: string;
    district_id?: string;
    organization_type?: string;
    website?: string;
    size_category?: string;
  }) =>
    apiFetch<{ user: AuthUser; message: string }>(
      "/api/v1/auth/register/employer",
      { method: "POST", body: JSON.stringify({ ...payload, role: "employer" }) },
    ),
  registerTrainingProvider: (payload: {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
    institute_name: string;
    provider_type?: string;
    district_id: string;
    registration_number?: string;
  }) =>
    apiFetch<{ user: AuthUser; message: string }>(
      "/api/v1/auth/register/training-provider",
      { method: "POST", body: JSON.stringify({ ...payload, role: "training_provider" }) },
    ),
  registerGovernmentOfficial: (payload: {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
    department: string;
    designation: string;
    district_id?: string;
    employee_code?: string;
  }) =>
    apiFetch<{ user: AuthUser; message: string }>(
      "/api/v1/auth/register/government-official",
      { method: "POST", body: JSON.stringify({ ...payload, role: "government_official" }) },
    ),
  // Government dashboard endpoint
  governmentDashboard: (params: {
    district_id?: string;
    sector_id?: string;
    job_role_id?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params.district_id) qs.set("district_id", params.district_id);
    if (params.sector_id) qs.set("sector_id", params.sector_id);
    if (params.job_role_id) qs.set("job_role_id", params.job_role_id);
    if (params.start_date) qs.set("start_date", params.start_date);
    if (params.end_date) qs.set("end_date", params.end_date);
    return apiFetch<{
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
        course_count: number;
      }>;
      training_capacity: {
        district_id: string;
        district_name: string;
        total_demand: number;
        verified_providers: number;
        course_offerings: number;
        total_capacity: number;
        capacity_status: string;
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
    }>(`/api/v1/government/dashboard?${qs.toString()}`);
  },
  // Training programs endpoint
  trainingPrograms: (params: {
    district_id?: string;
    sector_id?: string;
    status?: string;
    search?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params.district_id) qs.set("district_id", params.district_id);
    if (params.sector_id) qs.set("sector_id", params.sector_id);
    if (params.status) qs.set("status", params.status);
    if (params.search) qs.set("search", params.search);
    return apiFetch<any[]>(`/api/v1/government/training-programs?${qs.toString()}`);
  },

  governmentCandidates: (params: Record<string, any> = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") qs.set(key, String(value));
    });
    return apiFetch<any>(`/api/v1/government/candidates${qs.toString() ? `?${qs.toString()}` : ""}`);
  },

  trainingCentres: (params: { district_id?: string; sector_id?: string; search?: string; capacity_status?: string } = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") qs.set(key, String(value));
    });
    return apiFetch<any>(`/api/v1/government/training-centres${qs.toString() ? `?${qs.toString()}` : ""}`);
  },

  trainingCapacity: (districtId?: string) =>
    apiFetch<any>(`/api/v1/government/training-capacity${districtId ? `?district_id=${encodeURIComponent(districtId)}` : ""}`),

  trainingCapacityClassification: (params: Record<string, any> = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") qs.set(key, String(value));
    });
    return apiFetch<any>(`/api/v1/government/training-capacity/classification${qs.toString() ? `?${qs.toString()}` : ""}`);
  },

  courseAlignment: (courseId?: string) =>
    apiFetch<any>(`/api/v1/government/course-alignment${courseId ? `?course_id=${encodeURIComponent(courseId)}` : ""}`),

  districtIntelligence: (districtId?: string) =>
    apiFetch<any>(`/api/v1/government/districts${districtId ? `?district_id=${encodeURIComponent(districtId)}` : ""}`),

  districtRecommendations: (districtId?: string) =>
    apiFetch<any>(`/api/v1/government/district-recommendations/${districtId}`),

  emergingTechnologies: (params: Record<string, any> = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") qs.set(key, String(value));
    });
    return apiFetch<any>(`/api/v1/government/emerging-jobs${qs.toString() ? `?${qs.toString()}` : ""}`);
  },

  governmentEmployerInsights: (params: Record<string, any> = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") qs.set(key, String(value));
    });
    return apiFetch<any>(`/api/v1/government/employer-insights${qs.toString() ? `?${qs.toString()}` : ""}`);
  },

  demandEvidence: (params: Record<string, any> = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") qs.set(key, String(value));
    });
    return apiFetch<any>(`/api/v1/government/demand-evidence${qs.toString() ? `?${qs.toString()}` : ""}`);
  },

  governmentIndustrySurveys: (params: Record<string, any> = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") qs.set(key, String(value));
    });
    return apiFetch<any>(`/api/v1/government/industry-surveys${qs.toString() ? `?${qs.toString()}` : ""}`);
  },

  employerSurveys: () => apiFetch<any>(`/api/v1/government/employer-surveys`),

  governmentNotifications: (params: Record<string, any> = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") qs.set(key, String(value));
    });
    return apiFetch<any>(`/api/v1/government/notifications${qs.toString() ? `?${qs.toString()}` : ""}`);
  },

  governmentProfile: () => apiFetch<any>(`/api/v1/government/profile`),

  placementOutcomeReport: (params: Record<string, any> = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") qs.set(key, String(value));
    });
    return apiFetch<any>(`/api/v1/government/placement-outcomes${qs.toString() ? `?${qs.toString()}` : ""}`);
  },

  placementOutcomes: () => apiFetch<any>(`/api/v1/government/placement-outcomes`),

  trainingGaps: (districtId?: string) =>
    apiFetch<any>(`/api/v1/government/training-gaps${districtId ? `?district_id=${encodeURIComponent(districtId)}` : ""}`),

  districtSkillGapReport: (districtId?: string) =>
    apiFetch<any>(`/api/v1/government/reports/skill-gaps${districtId ? `?district_id=${encodeURIComponent(districtId)}` : ""}`),

  industryDemandReport: () => apiFetch<any>(`/api/v1/government/reports/industry-demand`),

  trainingCapacityReport: (districtId?: string) =>
    apiFetch<any>(`/api/v1/government/reports/training-capacity${districtId ? `?district_id=${encodeURIComponent(districtId)}` : ""}`),

  governmentUsers: (params: Record<string, any> = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") qs.set(key, String(value));
    });
    return apiFetch<any>(`/api/v1/government/users${qs.toString() ? `?${qs.toString()}` : ""}`);
  },

  districtPlans: (params: Record<string, any> = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") qs.set(key, String(value));
    });
    return apiFetch<any>(`/api/v1/government/district-recommendations/${params.district_id || ''}`);
  },

  trainingSupplyBySkill: (params: Record<string, any> = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") qs.set(key, String(value));
    });
    return apiFetch<any>(`/api/v1/government/training-supply${qs.toString() ? `?${qs.toString()}` : ""}`);
  },

  // Government Training Centre and Program Management
  createTrainingCentre: (data: {
    name: string;
    district_id: string;
    provider_type?: string;
    registration_number?: string;
    contact_person?: string;
    phone?: string;
    address?: string;
  }) => {
    return apiFetch<{
      provider_id: string;
      name: string;
      district_id: string;
      verification_status: string;
      message: string;
    }>(
      "/api/v1/government/training-centres",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  },

  createTrainingProgram: (data: {
    title: string;
    description?: string;
    district_id: string;
    industry_sector_id: string;
    duration_hours?: number;
    delivery_mode?: string;
    status?: string;
  }) => {
    return apiFetch<{
      course_id: string;
      title: string;
      message: string;
    }>(
      "/api/v1/government/training-programs",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  },

  assignProgramToCentre: (data: {
    course_id: string;
    provider_id: string;
    district_id: string;
    sanctioned_seats?: number;
    active_seats?: number;
    status?: string;
  }) => {
    return apiFetch<{
      offering_id: string;
      course_id: string;
      provider_id: string;
      message: string;
    }>(
      "/api/v1/government/training-programs/assign",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  },

  updateCourseStatus: (courseId: string, status: string) => {
    return apiFetch<{
      course_id: string;
      title: string;
      status: string;
      message: string;
    }>(
      `/api/v1/government/training-programs/${courseId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      },
    );
  },

  createTrainingProposal: (data: {
    course_id?: string;
    district_id: string;
    sector_id?: string;
    requested_skills?: string[];
    requested_capacity?: number;
    reason: string;
  }) => {
    return apiFetch<{
      proposal_id: string;
      status: string;
      message: string;
    }>(
      "/api/v1/government/training-proposals",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  },

  generateDistrictPlan: (districtId: string, startDate?: string, endDate?: string) => {
    const qs = new URLSearchParams({ district_id: districtId });
    if (startDate) qs.set("start_date", startDate);
    if (endDate) qs.set("end_date", endDate);
    return apiFetch<any>(`/api/v1/government/district-plan?${qs.toString()}`);
  },

  // Reports & Analytics endpoint
  governmentReports: (params: {
    district_id?: string;
    sector_id?: string;
    report_type?: string;
    time_period?: string;
    status?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params.district_id) qs.set("district_id", params.district_id);
    if (params.sector_id) qs.set("sector_id", params.sector_id);
    if (params.report_type) qs.set("report_type", params.report_type);
    if (params.time_period) qs.set("time_period", params.time_period);
    if (params.status) qs.set("status", params.status);
    return apiFetch<any>(`/api/v1/government/reports${qs.toString() ? `?${qs.toString()}` : ""}`);
  },

  // AI Chatbot endpoint
  aiChat: (params: {
    message: string;
    context?: Record<string, any>;
    language?: string;
  }) => {
    return apiFetch<{
      answer: string;
      sources: string[];
      data_context: Record<string, any>;
      language: string;
      fallback?: boolean;
    }>(
      "/api/v1/ai/chat",
      {
        method: "POST",
        body: JSON.stringify(params),
      },
    );
  },

  generateReport: (reportId: string, params?: Record<string, any>) => {
    const qs = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") qs.set(key, String(value));
      });
    }
    return apiFetch<any>(`/api/v1/government/reports/${reportId}/generate${qs.toString() ? `?${qs.toString()}` : ""}`, {
      method: 'POST'
    });
  },

  // Training Provider endpoints
  trainingProviderMe: () => apiFetch<{
    id: string;
    user_id: string;
    district_id: string;
    name: string;
    contact_person: string | null;
    phone: string | null;
    provider_type: string | null;
    registration_number: string | null;
    status: string;
    verification_status: string;
    submitted_at: string | null;
    source_scheme: string | null;
    source_city: string | null;
    source_address: string | null;
    source_email: string | null;
    source_sector: string | null;
  }>("/api/v1/training-providers/me"),

  updateTrainingProviderMe: (data: {
    name?: string;
    contact_person?: string;
    phone?: string;
    source_email?: string;
    source_address?: string;
    source_city?: string;
  }) => apiFetch<any>("/api/v1/training-providers/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  }),

  trainingProviderVerification: () => apiFetch<{
    provider_id: string;
    name: string;
    provider_type: string | null;
    status: string;
    verification_status: string;
  }>("/api/v1/training-providers/me/verification"),

  trainingProviderCapacity: () => apiFetch<any[]>("/api/v1/training-providers/me/capacity"),

  trainingProviderOfferings: (params: Record<string, any> = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") qs.set(key, String(value));
    });
    return apiFetch<any[]>(`/api/v1/training-providers/me/offerings${qs.toString() ? `?${qs.toString()}` : ""}`);
  },

  createTrainingProviderOffering: (data: {
    course_id: string;
    district_id: string;
    sanctioned_seats?: number;
    active_seats?: number;
    utilized_seats?: number;
  }) => apiFetch<any>("/api/v1/training-providers/me/offerings", {
    method: "POST",
    body: JSON.stringify(data),
  }),

  trainingProviderTrainers: (params: Record<string, any> = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") qs.set(key, String(value));
    });
    return apiFetch<any[]>(`/api/v1/training-providers/me/trainers${qs.toString() ? `?${qs.toString()}` : ""}`);
  },

  createTrainingProviderTrainer: (data: { name: string }) => apiFetch<any>("/api/v1/training-providers/me/trainers", {
    method: "POST",
    body: JSON.stringify(data),
  }),

  trainingProviderEquipment: (params: Record<string, any> = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") qs.set(key, String(value));
    });
    return apiFetch<any[]>(`/api/v1/training-providers/me/equipment${qs.toString() ? `?${qs.toString()}` : ""}`);
  },

  createTrainingProviderEquipment: (data: {
    district_id: string;
    name: string;
    quantity?: number;
    available_quantity?: number;
  }) => apiFetch<any>("/api/v1/training-providers/me/equipment", {
    method: "POST",
    body: JSON.stringify(data),
  }),

  registerTrainingProviderProfile: (data: {
    district_id: string;
    name: string;
    provider_type?: string;
    registration_number?: string;
  }) => apiFetch<{
    provider_id: string;
    name: string;
    verification_status: string;
    submitted_at: string | null;
  }>("/api/v1/training-providers/register", {
    method: "POST",
    body: JSON.stringify(data),
  }),

  // Support ticket endpoints
  supportTickets: () => apiFetch<any[]>("/api/v1/support/tickets"),

  createSupportTicket: (data: {
    category: string;
    subject: string;
    description: string;
    priority?: string;
  }) => apiFetch<any>("/api/v1/support/tickets", {
    method: "POST",
    body: JSON.stringify(data),
  }),

  supportTicket: (ticketId: string) => apiFetch<any>(`/api/v1/support/tickets/${ticketId}`),

  supportTicketResponses: (ticketId: string) => apiFetch<any[]>(`/api/v1/support/tickets/${ticketId}/responses`),

  createSupportTicketResponse: (ticketId: string, data: {
    response: string;
    is_internal?: boolean;
  }) => apiFetch<any>(`/api/v1/support/tickets/${ticketId}/responses`, {
    method: "POST",
    body: JSON.stringify(data),
  }),

  // Candidate applications endpoint
  applications: () => apiFetch<{
    id: string;
    job_posting_id: string;
    candidate_id: string;
    status: string;
    applied_at: string | null;
    job_title: string | null;
    job_company_name: string | null;
    job_district_name: string | null;
    job_posted_date: string | null;
  }[]>("/api/v1/applications"),

  courseApplications: () => apiFetch<{
    id: string;
    course_id: string;
    type: string;
    status: string;
    applied_date: string | null;
    course_title: string | null;
    course_provider: string | null;
    course_location: string | null;
  }[]>("/api/v1/applications/courses"),

  applyForCourse: (courseId: string) =>
    apiFetch<{
      id: string;
      course_id: string;
      status: string;
      enrollment_date: string | null;
      message: string;
    }>("/api/v1/applications/courses", {
      method: "POST",
      body: JSON.stringify({ course_id: courseId }),
    }),

  // Candidate profile endpoints
  candidateProfile: () => apiFetch<{
    id: string;
    user_id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    gender: string | null;
    district_id: string | null;
    date_of_birth: string | null;
    education_level: string | null;
    current_status: string | null;
    education_history: any[];
    career_interests: any[];
  }>("/api/v1/candidates/me"),

  updateCandidateProfile: (data: {
    full_name?: string;
    phone?: string;
    gender?: string;
    district_id?: string;
    date_of_birth?: string;
    education_level?: string;
    current_status?: string;
  }) => apiFetch<{
    id: string;
    user_id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    gender: string | null;
    district_id: string | null;
    date_of_birth: string | null;
    education_level: string | null;
    current_status: string | null;
    education_history: any[];
    career_interests: any[];
  }>("/api/v1/candidates/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  }),

  candidateSkills: () => apiFetch<{
    id: string;
    candidate_id: string;
    skill_id: string;
    skill_name: string | null;
    proficiency_level_id: string;
    proficiency_level_name: string | null;
    source: string;
    verification_status: string;
    last_assessed_date: string | null;
    evidence_reference: string | null;
  }[]>("/api/v1/candidates/me/skills"),

  addCandidateSkill: (data: {
    skill_id: string;
    proficiency_level_id: string;
    source?: string;
    verification_status?: string;
    last_assessed_date?: string;
    evidence_reference?: string;
  }) => apiFetch<{
    id: string;
    candidate_id: string;
    skill_id: string;
    skill_name: string | null;
    proficiency_level_id: string;
    proficiency_level_name: string | null;
    source: string;
    verification_status: string;
    last_assessed_date: string | null;
    evidence_reference: string | null;
  }>("/api/v1/candidates/me/skills", {
    method: "POST",
    body: JSON.stringify(data),
  }),

  updateCandidateSkill: (skillId: string, data: {
    proficiency_level_id?: string;
    source?: string;
    verification_status?: string;
    last_assessed_date?: string;
    evidence_reference?: string;
  }) => apiFetch<{
    id: string;
    candidate_id: string;
    skill_id: string;
    skill_name: string | null;
    proficiency_level_id: string;
    proficiency_level_name: string | null;
    source: string;
    verification_status: string;
    last_assessed_date: string | null;
    evidence_reference: string | null;
  }>(`/api/v1/candidates/me/skills/${skillId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  }),

  deleteCandidateSkill: (skillId: string) => apiFetch<{ message: string }>(`/api/v1/candidates/me/skills/${skillId}`, {
    method: "DELETE",
  }),

  candidateSkillGaps: (jobRoleId?: string) => 
    apiFetch<any[]>(`/api/v1/candidates/me/skill-gaps${jobRoleId ? `?job_role_id=${jobRoleId}` : ""}`),

  candidateRecommendedSkills: () => apiFetch<{
    recommended_skills: Array<{
      skill_id: string;
      skill_name: string;
      category: string | null;
      current_proficiency: string | null;
      required_proficiency: string;
      gap_status: string;
      demand_relevance: string;
      priority: string;
      reason: string;
      related_job_roles: string[];
      demand_score: number;
    }>;
    reason: string;
  }>("/api/v1/candidates/me/recommended-skills"),

  requestSkillVerification: (skillId: string, data: {
    evidence_reference?: string;
    last_assessed_date?: string;
  }) => apiFetch<{
    id: string;
    candidate_id: string;
    skill_id: string;
    skill_name: string | null;
    proficiency_level_id: string;
    proficiency_level_name: string | null;
    source: string;
    verification_status: string;
    last_assessed_date: string | null;
    evidence_reference: string | null;
  }>(`/api/v1/candidates/me/skills/${skillId}/verify`, {
    method: "POST",
    body: JSON.stringify(data),
  }),

  candidateEnrollments: () => apiFetch<{
    id: string;
    course_id: string;
    status: string;
    enrollment_date: string | null;
    completion_date: string | null;
    grade_outcome: string | null;
    course: {
      id: string;
      title: string;
      description: string | null;
      duration_hours: number | null;
      delivery_mode: string | null;
      status: string;
    } | null;
  }[]>("/api/v1/candidates/me/enrollments"),

  enrollInCourse: (courseId: string) =>
    apiFetch<{
      id: string;
      course_id: string;
      status: string;
      enrollment_date: string | null;
      message: string;
    }>("/api/v1/candidates/me/enrollments", {
      method: "POST",
      body: JSON.stringify({ course_id: courseId }),
    }),

  candidateTrainingRecommendations: () => apiFetch<{
    recommended_courses: Array<{
      course_id: string;
      course_title: string;
      description: string | null;
      gap_relevance_score: number;
      addresses_gaps: string[];
      reason: string;
    }>;
    missing_skills: string[];
    total_gaps: number;
    courses_available: number;
    reason: string | null;
  }>("/api/v1/candidates/me/training-recommendations"),

  candidateJobRecommendations: () => apiFetch<{
    recommended_jobs: Array<{
      id: string;
      title: string;
      company_name: string | null;
      district_name: string | null;
      skill_match_score: number;
      required_skills: string[];
      job_url: string | null;
    }>;
    reason: string;
  }>("/api/v1/candidates/me/job-recommendations"),

  // Employer candidates endpoint
  employerCandidates: () => apiFetch<any[]>("/api/v1/employers/me/candidates"),

  employerApplications: () => apiFetch<any[]>("/api/v1/employers/me/applications"),

  // Employer Intelligence endpoints
  employerIntelligenceDemand: (params: {
    district_id?: string;
    sector_id?: string;
    job_role_id?: string;
    date_from?: string;
    date_to?: string;
  } = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") qs.set(key, String(value));
    });
    return apiFetch<{
      total_demand: number;
      open_job_postings: number;
      districts_covered: number;
      top_roles: Array<{ id: string; title: string; demand: number }>;
      top_sectors: Array<{ id: string; name: string; demand: number }>;
      top_skills: Array<{ id: string; name: string; demand: number }>;
    }>(`/api/v1/employer/intelligence/demand${qs.toString() ? `?${qs.toString()}` : ""}`);
  },

  employerIntelligenceRoles: (params: {
    district_id?: string;
    sector_id?: string;
  } = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") qs.set(key, String(value));
    });
    return apiFetch<Array<{
      id: string;
      title: string;
      sector: string | null;
      open_postings: number;
      demand_count: number;
      demand_classification: string | null;
    }>>(`/api/v1/employer/intelligence/roles${qs.toString() ? `?${qs.toString()}` : ""}`);
  },

  employerIntelligenceSkills: (params: {
    district_id?: string;
    sector_id?: string;
  } = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") qs.set(key, String(value));
    });
    return apiFetch<Array<{
      id: string;
      name: string;
      demand: number;
      associated_roles: string[];
      required_proficiency: string | null;
      mapped_training_count: number;
    }>>(`/api/v1/employer/intelligence/skills${qs.toString() ? `?${qs.toString()}` : ""}`);
  },

  employerSkillGaps: (params: {
    job_role_id: string;
    district_id?: string;
    sector_id?: string;
  }) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") qs.set(key, String(value));
    });
    return apiFetch<Array<{
      skill_id: string;
      skill_name: string;
      required: boolean;
      importance: string | null;
      required_proficiency: string | null;
      demand_score: number | null;
      demand_trend: string | null;
      candidate_supply: number;
      gap_status: string;
    }>>(`/api/v1/employer/intelligence/skill-gaps${qs.toString() ? `?${qs.toString()}` : ""}`);
  },

  employerIntelligenceTrends: (params: {
    district_id?: string;
    sector_id?: string;
    skill_id?: string;
    date_from?: string;
    date_to?: string;
  } = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") qs.set(key, String(value));
    });
    return apiFetch<{
      status: string;
      message: string | null;
      increasing_skills: number;
      stable_skills: number;
      emerging_skills: number;
      trend_direction: string | null;
      current_period: string | null;
      historical_data: Array<{
        period_start: string | null;
        period_end: string | null;
        demand_value: number;
      }> | null;
    }>(`/api/v1/employer/intelligence/trends${qs.toString() ? `?${qs.toString()}` : ""}`);
  },

  employerIntelligenceWorkforce: (params: {
    district_id?: string;
    sector_id?: string;
  } = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") qs.set(key, String(value));
    });
    return apiFetch<{
      status: string;
      message: string | null;
      candidate_supply: number | null;
      skill_supply: number | null;
      applications: number | null;
      skill_availability: Array<{ skill: string; count: number }> | null;
      district_distribution: Array<{ district: string; count: number }> | null;
    }>(`/api/v1/employer/intelligence/workforce${qs.toString() ? `?${qs.toString()}` : ""}`);
  },

  employerIntelligenceRequirements: (params: {
    district_id?: string;
    sector_id?: string;
    job_role_id?: string;
  } = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") qs.set(key, String(value));
    });
    return apiFetch<Array<{
      skill: string;
      job_role: string;
      importance: string | null;
      proficiency: string | null;
      demand: number;
    }>>(`/api/v1/employer/intelligence/requirements${qs.toString() ? `?${qs.toString()}` : ""}`);
  },

  // Career Planning endpoints
  careerPlanning: (params: {
    district_id?: string;
    sector?: string;
  } = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") qs.set(key, String(value));
    });
    return apiFetch<{
      district: string | null;
      plans: Array<{
        id: string;
        district_id: string | null;
        district_name: string;
        sector: string;
        priority_skills: string[];
        pg_training: string[];
        job_roles: string[];
        created_at: string;
        related_courses: Array<{
          id: string;
          title: string;
          description: string | null;
          district_id: string | null;
          status: string;
          skills_covered: string[];
        }>;
        related_jobs: Array<{
          id: string;
          title: string;
          company_name: string | null;
          district_id: string | null;
          status: string;
          posted_date: string | null;
        }>;
      }>;
    }>(`/api/v1/career-planning${qs.toString() ? `?${qs.toString()}` : ""}`);
  },

  careerPlanningDistricts: () => apiFetch<Array<{
    district_id: string;
    district_name: string;
    plan_count: number;
  }>>("/api/v1/career-planning/districts"),

  careerPlanningSectors: () => apiFetch<string[]>("/api/v1/career-planning/sectors"),

  // Resume endpoints
  resumeUpload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiFetch<{ id: string; filename: string; upload_date: string }>("/api/v1/candidates/resume/upload", {
      method: "POST",
      headers: {
        // Don't set Content-Type for FormData - let browser set it with boundary
      },
      body: formData as any, // Type assertion needed for FormData
    });
  },

  resumeList: () => apiFetch<Array<{
    id: string;
    filename: string;
    upload_date: string;
    status: string;
  }>>("/api/v1/candidates/resume/list"),

  resumeProcess: (resumeId: string) => 
    apiFetch<{ message: string }>(`/api/v1/candidates/resume/${resumeId}/process`, {
      method: "POST",
    }),

  resumeReview: (resumeId: string) => 
    apiFetch<{
      resume_id: string;
      processing_status: string;
      extracted_skills: Array<{
        skill_id: string;
        skill_name: string;
        confidence: number;
      }>;
      extracted_education: any[];
      extracted_experience: any[];
      candidate_id: string;
    }>(`/api/v1/candidates/resume/${resumeId}/review`),

  resumeConfirmSkills: (resumeId: string, data: {
    resume_id: string;
    confirmed_skills: string[];
    rejected_skills: string[];
    additional_skills: Array<{
      skill_name: string;
      confidence: number;
      category: string;
    }>;
  }) => 
    apiFetch<{ message: string }>(`/api/v1/candidates/resume/${resumeId}/confirm-skills`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
