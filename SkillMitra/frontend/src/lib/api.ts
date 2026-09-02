const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
  industry_sector: {
    id: string;
    name: string;
    code: string | null;
    description: string | null;
  } | null;
};

export type Course = {
  id: string;
  title: string;
  description: string | null;
  district_id: string | null;
  status: string | null;
  delivery_mode: string | null;
};

export type JobPosting = {
  id: string;
  title: string;
  status: string;
  posted_date: string | null;
  district_id: string | null;
  employer_name: string | null;
  job_posting_skills: Array<{
    skill_id: string;
    proficiency_level_id: string | null;
    importance: string | null;
    skill: { id: string; name: string; category: { id: string; name: string } | null } | null;
  }>;
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
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (typeof body?.detail === "string") detail = body.detail;
      else if (Array.isArray(body?.detail)) detail = body.detail[0]?.msg ?? detail;
    } catch {
      /* keep default */
    }
    // Don't throw error for government dashboard permission issues
    // This allows the dashboard to fall back to demo data silently
    if (path.includes('/government/dashboard') && response.status === 403) {
      throw new Error('DEMO_FALLBACK');
    }
    throw new Error(detail);
  }
  return response.json() as Promise<T>;
}

export const api = {
  districts: () => apiFetch<District[]>("/api/v1/geography/districts"),
  sectors: () => apiFetch<IndustrySector[]>("/api/v1/industry/sectors"),
  skills: () => apiFetch<Paginated<Skill>>("/api/v1/skills?page=1&page_size=100"),
  courses: () => apiFetch<Paginated<Course>>("/api/v1/courses?page=1&page_size=12"),
  jobs: () => apiFetch<Paginated<JobPosting>>("/api/v1/jobs?page=1&page_size=6"),
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
  jobRoles: (sectorId?: string) =>
    apiFetch<JobRole[]>(
      `/api/v1/job-roles${sectorId ? `?industry_sector_id=${encodeURIComponent(sectorId)}` : ""}`,
    ),
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
        id: string;
        title: string;
        description: string | null;
        covers: string[];
        why: string;
      }>;
      job_readiness_percentage: number;
      candidate_authenticated: boolean;
      message: string | null;
    }>(`/api/v1/career-guidance/recommendation?${qs.toString()}`);
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
  }) => {
    const qs = new URLSearchParams();
    if (params.district_id) qs.set("district_id", params.district_id);
    if (params.sector_id) qs.set("sector_id", params.sector_id);
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
  }) => {
    const qs = new URLSearchParams();
    if (params.district_id) qs.set("district_id", params.district_id);
    if (params.sector_id) qs.set("sector_id", params.sector_id);
    if (params.status) qs.set("status", params.status);
    return apiFetch<any[]>(`/api/v1/government/training-programs?${qs.toString()}`);
  },

  governmentCandidates: (params: Record<string, any> = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") qs.set(key, String(value));
    });
    return apiFetch<any>(`/api/v1/government/candidates${qs.toString() ? `?${qs.toString()}` : ""}`);
  },

  trainingCentres: (params: Record<string, any> = {}) => {
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
    apiFetch<any>(`/api/v1/government/recommendations${districtId ? `?district_id=${encodeURIComponent(districtId)}` : ""}`),

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
    return apiFetch<any>(`/api/v1/government/district-plans${qs.toString() ? `?${qs.toString()}` : ""}`);
  },

  trainingSupplyBySkill: (params: Record<string, any> = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") qs.set(key, String(value));
    });
    return apiFetch<any>(`/api/v1/government/training-supply${qs.toString() ? `?${qs.toString()}` : ""}`);
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
};
