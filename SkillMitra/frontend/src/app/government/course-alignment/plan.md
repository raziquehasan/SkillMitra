# Course Alignment Page Redesign Implementation Plan

## Overview
Transform the current basic course-alignment page into a comprehensive government analytics dashboard that provides immediate value without requiring course selection.

## Current State Analysis
- **File**: `frontend/src/app/government/course-alignment/page.tsx`
- **Current Features**: Single course dropdown, empty state, basic alignment display for selected course
- **Limitations**: No filters, no aggregate view, no fallback data, limited pagination (12 courses only)
- **Backend APIs Available**:
  - `/api/v1/government/course-alignment?course_id={id}` - Single course alignment
  - `/api/v1/government/dashboard` - Includes course_alignment field (currently mock data)
  - `/api/v1/courses/alignment/demand/{demand_id}` - Demand-based alignment
  - `/api/v1/courses/alignment/skill-gap/{job_role_id}` - Skill gap analysis

## Design Requirements
- **Page Header**: "Course Alignment" with subtitle "Analyze how well training courses address industry-demanded skills across Maharashtra."
- **Filter Bar**: District | Sector | Course | Alignment Status | Skill Search + Reset
- **5 KPI Cards**: Total Courses, Aligned Courses, Skills Covered, Skills With Gaps, Average Alignment
- **Charts**: Alignment overview (horizontal bar), Alignment status (donut/pie), Skill coverage analysis, Demand vs coverage
- **Tables**: Course alignment directory, District alignment summary
- **Detail View**: Selected course detail with alignment score visual
- **Design**: Government institutional style (#1e3a8a blue, white cards, 4-6px radius, no gradients)
- **Data Strategy**: Try backend API first, fall back to local demo data

## Implementation Approach

### Phase 1: Data Architecture & Types

#### 1.1 Define TypeScript Interfaces
Add to `frontend/src/lib/api.ts`:
```typescript
export interface CourseAlignmentData {
  course_id: string;
  course_title: string;
  provider: string;
  sector: string;
  district_id: string | null;
  alignment_status: "ALIGNED" | "PARTIAL" | "NEEDS_REVIEW";
  skills_covered: string[];
  skills_demanded: string[];
  gaps: string[];
  coverage_percentage: number;
  priority: "High" | "Medium" | "Low";
}

export interface SkillCoverage {
  skill_name: string;
  demand: number;
  coverage: number;
  gap: number;
}

export interface DistrictAlignmentSummary {
  district_id: string;
  district_name: string;
  total_courses: number;
  strong_alignment: number;
  partial: number;
  needs_review: number;
  average_alignment: number;
}
```

#### 1.2 Create Fallback Dataset
Define comprehensive demo data following the pattern in `employment-outcomes/page.tsx`:
- 15-20 courses with realistic alignment data
- 10-12 districts with alignment summaries
- 8-10 skills with coverage analysis
- Maharashtra-focused content (Pune, Mumbai, Nashik, etc.)

### Phase 2: Core Component Structure

#### 2.1 Filter Bar Component
- District dropdown (All Districts + loaded districts)
- Sector dropdown (All Sectors + loaded sectors)
- Course dropdown (All Courses + loaded courses)
- Alignment Status dropdown (All Statuses, Aligned, Partial, Needs Review)
- Skill search input with search icon
- Reset filters button (shown when filters active)
- Follow pattern from `employment-outcomes/page.tsx` lines 150-180

#### 2.2 KPI Cards Component
- 5 cards in a horizontal grid
- Each card: icon, label, value
- Use institutional blue (#1e3a8a) for primary values
- Follow pattern from `employment-outcomes/page.tsx` lines 200-250
- Calculate dynamically from filtered data

#### 2.3 Charts Components
**Alignment Overview Chart**:
- Horizontal bar chart ranking courses by alignment percentage
- Custom SVG or CSS-based bars (no heavy chart libraries)
- Show top 10 courses

**Alignment Status Donut**:
- SVG donut chart showing Strong/Partial/Needs Review distribution
- Follow pattern from `candidates/page.tsx` lines 342-367

**Skill Coverage Analysis**:
- Horizontal bars showing Demand vs Coverage vs Gap
- Custom progress bars with different colors

**Demand vs Coverage Chart**:
- Grouped bar chart (Demanded Skills vs Covered Skills)
- Simple CSS-based grouped bars

#### 2.4 Course Alignment Directory Table
- Columns: Course, Provider, Sector, Skills Covered, Skills Required, Alignment, Priority, Status
- Alignment column: progress bar visual
- Status badges: ALIGNED (green), PARTIAL (yellow), NEEDS REVIEW (red)
- Compact rows with proper spacing
- Follow table pattern from other government pages

#### 2.5 Selected Course Detail Section
- Only shown when specific course selected
- Course name, provider, sector, overall alignment score
- Ring/progress visual for alignment score
- Two columns: Required Skills vs Covered Skills vs Gaps
- Recommended alignment actions (derived from gaps)

#### 2.6 District Alignment Summary
- Table/list showing district-level alignment metrics
- District, Courses, Strong Alignment, Partial, Needs Review, Average Alignment
- Sortable by average alignment

### Phase 3: State Management

#### 3.1 State Variables
```typescript
const [districts, setDistricts] = useState<District[]>([]);
const [sectors, setSectors] = useState<IndustrySector[]>([]);
const [courses, setCourses] = useState<Course[]>([]);
const [alignmentData, setAlignmentData] = useState<CourseAlignmentData[]>([]);
const [loading, setLoading] = useState(true);
const [fetching, setFetching] = useState(false);
const [error, setError] = useState<string | null>(null);
const [usingDemoData, setUsingDemoData] = useState(false);

// Filters
const [filterDistrict, setFilterDistrict] = useState("");
const [filterSector, setFilterSector] = useState("");
const [filterCourse, setFilterCourse] = useState("");
const [filterStatus, setFilterStatus] = useState("");
const [filterSkill, setFilterSkill] = useState("");
```

#### 3.2 Data Loading Strategy
- On mount: Load districts, sectors, courses in parallel
- Try to load alignment data from multiple API endpoints
- If API fails or returns empty, use fallback dataset
- Set `usingDemoData` flag for tracking (but don't display to user)

#### 3.3 Filter Logic
- Filter alignment data based on all filter combinations
- Recalculate KPIs when filters change
- Update all charts and tables when filters change
- Clear specific course selection when switching to "All Courses"

### Phase 4: API Integration

#### 4.1 Primary API Strategy
Try multiple endpoints in order:
1. `/api/v1/government/dashboard` - Get course_alignment field
2. `/api/v1/government/course-alignment` - Try without course_id for bulk data
3. If above fail, call `/api/v1/courses` and then iterate alignment for each course
4. Fall back to demo data

#### 4.2 Error Handling
- Clean error states (no raw technical errors)
- Silent fallback to demo data
- User-friendly error messages only for critical failures
- Follow pattern from `employment-outcomes/page.tsx` lines 140-150

### Phase 5: UI Implementation

#### 5.1 Page Layout
```
Page Header
Filter Bar
5 KPI Cards (horizontal)
2-Column Section:
  Left: Course Alignment Overview (horizontal bar chart)
  Right: Alignment Status (donut chart)
Full-Width: Skill Coverage Analysis (horizontal bars)
2-Column Section:
  Left: Industry Demand vs Course Coverage (grouped bars)
  Right: Priority Skill Gaps (ranked list)
Course Alignment Directory (table)
Selected Course Detail (conditional, below directory)
District Alignment Summary (table)
```

#### 5.2 Styling Guidelines
- Background: `#f4f7fa` or `#F5F7FA`
- Cards: `bg-white rounded-md border border-slate-200 shadow-sm`
- Primary blue: `#1e3a8a` or `#123b68`
- Border radius: 4-6px
- Typography: Compact, institutional
- No gradients, no glassmorphism, no neon colors
- Status colors: Green (aligned), Amber (partial), Red (needs review)

#### 5.3 Responsive Design
- 1440px+: Full analytics layout
- 1280px: All sections visible without awkward wrapping
- 1024px: 2-column layouts where appropriate
- Mobile: Stack sections vertically
- Tables: Horizontal scroll on mobile only

### Phase 6: Calculations & Metrics

#### 6.1 KPI Calculations
```typescript
const totalCourses = filteredData.length;
const alignedCourses = filteredData.filter(c => c.alignment_status === "ALIGNED").length;
const skillsCovered = filteredData.reduce((sum, c) => sum + c.skills_covered.length, 0);
const skillsWithGaps = filteredData.filter(c => c.gaps.length > 0).length;
const averageAlignment = filteredData.reduce((sum, c) => sum + c.coverage_percentage, 0) / totalCourses;
```

#### 6.2 Alignment Percentage
```typescript
const alignmentPercentage = (coveredSkills / requiredSkills) * 100;
const gap = requiredSkills - coveredSkills;
```

#### 6.3 District Metrics
- Calculate per district from course data
- Group by district_id, aggregate alignment data
- Calculate averages per district

### Phase 7: File Structure

#### 7.1 Main File
- `frontend/src/app/government/course-alignment/page.tsx` - Complete rewrite

#### 7.2 No New Files Needed
- Keep everything in page.tsx following existing patterns
- No separate components needed (inline components are standard in this codebase)

### Phase 8: Implementation Order

1. **Step 1**: Define TypeScript interfaces and fallback dataset
2. **Step 2**: Implement state management and data loading
3. **Step 3**: Build filter bar with all filters
4. **Step 4**: Implement 5 KPI cards with dynamic calculations
5. **Step 5**: Build alignment overview chart (horizontal bars)
6. **Step 6**: Build alignment status donut chart
7. **Step 7**: Build skill coverage analysis section
8. **Step 8**: Build demand vs coverage chart
9. **Step 9**: Build priority skill gaps list
10. **Step 10**: Build course alignment directory table
11. **Step 11**: Build selected course detail section
12. **Step 12**: Build district alignment summary
13. **Step 13**: Implement responsive design
14. **Step 14**: Add loading/error/empty states
15. **Step 15**: Test API integration and fallback

### Phase 9: Verification

#### 9.1 TypeScript Check
```bash
npx tsc --noEmit
```
- Fix all TypeScript errors
- Ensure proper type safety

#### 9.2 Build Check
```bash
npm run build
```
- Fix all build errors
- Fix all React key warnings
- Fix all ESLint errors

#### 9.3 Browser Verification
Open `http://localhost:3000/government/course-alignment` and verify:
- ✓ No giant blank whitespace
- ✓ Filters visible and functional
- ✓ 5 KPI cards visible with correct values
- ✓ Charts render correctly
- ✓ Course alignment table visible
- ✓ Priority gaps visible
- ✓ District summary visible
- ✓ Selecting a course updates detail section
- ✓ Filters actually work and update all visualizations
- ✓ Backend data works when available
- ✓ Fallback data works when API unavailable
- ✓ No horizontal overflow on desktop
- ✓ No console errors
- ✓ No React key errors
- ✓ Responsive at 1440px, 1280px, 1024px, mobile

#### 9.4 Acceptance Criteria
The page is complete only if:
- ✓ Complete filter bar with all 5 filters
- ✓ 5 KPI cards with dynamic calculations
- ✓ Alignment overview chart
- ✓ Alignment status donut/pie chart
- ✓ Skill coverage analysis
- ✓ Demand vs coverage chart
- ✓ Priority skill gaps list
- ✓ Course alignment directory table
- ✓ Selected course detail section
- ✓ District alignment summary
- ✓ Backend data support
- ✓ Local fallback data support
- ✓ Dynamic calculations (not hardcoded)
- ✓ Responsive design
- ✓ No visible demo/fallback/mock labeling
- ✓ No backend/database/auth changes
- ✓ No large unused whitespace
- ✓ Aggregate view useful immediately on page load

## Critical Files to Modify

1. **Primary**: `frontend/src/app/government/course-alignment/page.tsx` - Complete rewrite
2. **Optional**: `frontend/src/lib/api.ts` - Add alignment-related type definitions

## Files NOT to Modify

- `backend/` - No backend changes
- `frontend/src/app/government/GovernmentShell.tsx` - No changes
- `frontend/src/app/government/GovernmentLayout.tsx` - No changes
- Any database or authentication files
- Any API endpoints or routes

## Key Patterns to Follow

1. **Data Loading Pattern**: From `employment-outcomes/page.tsx` - try API first, fallback to demo data
2. **Filter Pattern**: From `employment-outcomes/page.tsx` - comprehensive filter bar with reset
3. **KPI Pattern**: From dashboard and employment-outcomes - cards with icons and values
4. **Chart Pattern**: From candidates/page.tsx - custom SVG donut, CSS progress bars
5. **Table Pattern**: From multiple government pages - compact tables with status badges
6. **Styling Pattern**: Government blue (#1e3a8a), white cards, institutional design
7. **State Pattern**: Loading, fetching, error, usingDemoData flags

## Risk Mitigation

1. **API Failure**: Comprehensive fallback dataset ensures page always works
2. **Performance**: Lazy load alignment data, show loading states
3. **Type Safety**: Define interfaces before implementation
4. **Responsive**: Test at multiple breakpoints
5. **Data Consistency**: Ensure calculations don't exceed 100%, handle edge cases

## Timeline Estimate

- Phase 1-2 (Data & Structure): 2-3 hours
- Phase 3-5 (Components & UI): 4-5 hours
- Phase 6-7 (Calculations & Integration): 2-3 hours
- Phase 8-9 (Testing & Verification): 1-2 hours
- **Total**: 9-13 hours

## Success Metrics

1. Page loads with useful data immediately (no course selection required)
2. All filters work and update all visualizations
3. Backend data is used when available
4. Fallback data provides seamless experience when API fails
5. TypeScript and build pass without errors
6. Browser verification passes all criteria
7. Page looks like a professional government analytics dashboard
