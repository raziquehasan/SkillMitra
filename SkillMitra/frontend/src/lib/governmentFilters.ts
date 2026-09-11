/**
 * Canonical Government Filter State
 * 
 * This is the single source of truth for Government-side filtering.
 * All Government analytics must use this filter structure.
 */

export type GovernmentFilters = {
  district_id: string | null;
  sector_id: string | null;
  job_role_id: string | null;
  start_date: string | null;
  end_date: string | null;
};

export const DEFAULT_GOVERNMENT_FILTERS: GovernmentFilters = {
  district_id: null,
  sector_id: null,
  job_role_id: null,
  start_date: null,
  end_date: null,
};

/**
 * Check if any filter is active (demo vs live mode)
 * Note: Date filters (start_date, end_date) don't trigger live mode by themselves
 * Only district_id, sector_id, and job_role_id trigger live mode
 */
export function isFiltersActive(filters: GovernmentFilters): boolean {
  return !!(
    filters.district_id ||
    filters.sector_id ||
    filters.job_role_id
  );
}

/**
 * Parse URL query parameters to GovernmentFilters
 */
export function parseGovernmentFilters(searchParams: URLSearchParams): GovernmentFilters {
  return {
    district_id: searchParams.get('district_id'),
    sector_id: searchParams.get('sector_id'),
    job_role_id: searchParams.get('job_role_id'),
    start_date: searchParams.get('start_date'),
    end_date: searchParams.get('end_date'),
  };
}

/**
 * Convert GovernmentFilters to URL query parameters
 */
export function governmentFiltersToQueryParams(filters: GovernmentFilters): Record<string, string> {
  const params: Record<string, string> = {};
  
  if (filters.district_id) params.district_id = filters.district_id;
  if (filters.sector_id) params.sector_id = filters.sector_id;
  if (filters.job_role_id) params.job_role_id = filters.job_role_id;
  if (filters.start_date) params.start_date = filters.start_date;
  if (filters.end_date) params.end_date = filters.end_date;
  
  return params;
}

/**
 * Calculate date range from time period selector
 */
export function getDateRangeFromTimePeriod(timePeriod: string): { start_date: string; end_date: string } | null {
  const today = new Date();
  const end_date = today.toISOString().split('T')[0];
  
  let start_date: Date;
  
  switch (timePeriod) {
    case 'all_available':
      return null; // No date filter - show all available data
    case 'last_7_days':
      start_date = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'last_30_days':
      start_date = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'last_quarter':
      start_date = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case 'last_6_months':
      start_date = new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000);
      break;
    case 'last_12_months':
      start_date = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    case 'year_to_date':
      start_date = new Date(today.getFullYear(), 0, 1);
      break;
    default:
      return null;
  }
  
  return {
    start_date: start_date.toISOString().split('T')[0],
    end_date,
  };
}

/**
 * Get API parameters from GovernmentFilters
 */
export function getGovernmentApiParams(filters: GovernmentFilters): Record<string, string | undefined> {
  return {
    district_id: filters.district_id || undefined,
    sector_id: filters.sector_id || undefined,
    job_role_id: filters.job_role_id || undefined,
    start_date: filters.start_date || undefined,
    end_date: filters.end_date || undefined,
  };
}