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
};
