# SkillMitra Phase 3.1 Intelligence Status

## Scope

Phase 3.1 strengthens the existing FastAPI business API using only data present in the Supabase PostgreSQL schema. The implementation remains deterministic, database-backed, and does not add ML, scraping, or migrations.

## Existing Schema Audit

The live schema contains the Phase 2A, 2B, and 2C tables: candidate profiles and education/interests, jobs and applications, courses and enrollments, placements, demand signals, industry demand, geography, skills, and proficiency levels.

The following Phase 1 entities are **NOT_YET_AVAILABLE** in the live database and ORM: `candidate_skills`, `skill_gaps`, curricula, curriculum skills, trainers, trainer skills, equipment, course equipment, district training plans, and employer validation detail fields/entities. No replacement tables were created.

## Implemented APIs

- `GET /api/v1/demand`: raw demand signals with filters for district, industry is represented through aggregate data, role, skill, proficiency, and date range. `source_type` identifies `job_posting` or `employer_survey`.
- `GET /api/v1/demand/industries`: persisted aggregate demand filtered by district, industry, role, skill, proficiency, and overlapping period.
- `GET /api/v1/demand/districts`, `/job-roles`, `/skills`: aggregate demand views using database UUID filters.
- `GET /api/v1/demand/courses`: maps persisted demanded skills to course skills. It reports skill IDs and coverage status only.
- `GET /api/v1/government/demand`: government-only aggregate demand filters.
- `GET /api/v1/government/placements`: government-only placement filters for district, role, employer, outcome, and date.
- `GET /api/v1/government/placement-analytics`: counts enrolled, completed, applied, and placed records, with optional course/role/district/employer/outcome filters.
- `GET /api/v1/career-guidance`: deterministic interest-based role options enriched with district demand record counts, relevant course counts, and explanatory reasons.

## Candidate Skill Gap (superseded by Phase 4)

Phase 3.1 originally recorded this as **NOT_YET_AVAILABLE**. Phase 4 adds `candidate_skills` and moves the implemented proficiency-aware comparison to the candidate skill-gap API.

## Career Guidance

**SUPPORTED BY CURRENT DATA:** candidate career interests, job-role requirements, district, persisted industry-demand records, and course-to-skill mappings. Each option explains its interest, district-demand, and course-coverage evidence.

Candidate skill matching remains **NOT_YET_AVAILABLE**.

## Course-Demand Mapping

The course endpoint takes the distinct skill IDs in matching `industry_demand` rows and intersects them with `course_skills`. `coverage_status` is `SUPPORTED_BY_CURRENT_DATA`. This is not an oversupply, employability, or placement probability calculation.

## Placement Analytics

Counts use real tables: `course_enrollments.status = 'enrolled'` or `'completed'`, all application rows, and placement rows. A placement rate is **NOT_YET_AVAILABLE** because the API has no single validated cohort/time-window denominator spanning those datasets. No rate is fabricated.

## Government Analytics

Government demand and placement endpoints require the `government_admin` role. Geography is represented by database UUIDs; city names are not hard-coded. Raw signal and aggregate demand are separate views.

## Unsupported and Future Dependencies

- Candidate skills and persisted skill gaps: **NOT_YET_AVAILABLE**, requires an approved database phase.
- Curriculum alignment and curriculum update recommendations: **NOT_YET_AVAILABLE**, curricula tables are absent.
- Trainer development, equipment planning, and operational capacity: **NOT_YET_AVAILABLE**, trainer/equipment tables are absent. The provider capacity endpoint returns this state and no numbers.
- Employer validation details: **NOT_YET_AVAILABLE**, only survey response identity records currently exist.
- Forecasting, growth percentages, scoring, oversupply, placement probability, and district training requirements: **NOT_YET_AVAILABLE**.
- External ingestion and scraping: not implemented by design.

## Security and API Behavior

Existing custom JWT and RBAC are unchanged. Government endpoints require `government_admin`; candidate endpoints require `candidate`; employer and training-provider ownership checks remain in their existing services. Pagination keeps the existing `page` and `page_size` maximum of 100. Invalid date ranges return HTTP 422.

## Exact Deterministic Formulas

- Course coverage set = demanded skill IDs intersected with the course's `course_skills.skill_id` values.
- Enrolled count = count of `course_enrollments` rows, optionally filtered by course.
- Completed count = count of those rows with `status = 'completed'`.
- Applied count = count of `applications` rows under the supported filters.
- Placed count = count of `placements` rows under the supported filters.
- Placement rate = **NOT_YET_AVAILABLE**; no denominator is asserted.

## Verification

- Pre-change baseline: 109 tests passed.
- Focused API regression after changes: 30 tests passed.
- Full pytest and `alembic check`: run as the final verification for this phase.

No schema changes were made.
