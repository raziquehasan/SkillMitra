# SkillMitra Phase 6 Gap Analysis

## Audit Basis

Reviewed the Phase 1 database documents, Phase 4 architecture, Phase 5 intelligence documentation, current models/services/routes/tests/Alembic revisions, Git history, and the live Supabase PostgreSQL schema on 2026-08-27. The repository starts clean on `main` at the Phase 5 commit.

## Reusable Architecture

Existing canonical sources are `data_sources`, `job_postings`, `job_posting_skills`, `job_roles`, `skills`, `skill_aliases`, `industry_sectors`, `districts`, `employer_surveys`, `employer_survey_responses`, `demand_signals`, `industry_demand`, curriculum tables, training supply tables, placements, and the Phase 5 `IntelligenceService`.

Custom JWT/RBAC, SQLAlchemy, Alembic, and Supabase PostgreSQL remain unchanged. No Supabase Auth, URL fetching, scraping, paid LLM API, or new dependency is needed.

## Current Gaps

- `data_sources` exists but has no source URL/status metadata and no ingestion-run relationship.
- `data_ingestion_runs` is documented in Phase 1 but absent from live schema and ORM.
- No raw job-posting staging table exists; canonical `job_postings` requires mapped role, district, employer, and source.
- No durable rejected-record audit exists.
- `skill_aliases` supports exact curated aliases; no reusable normalization service exists.
- No role alias table exists; ambiguous titles must remain `UNMAPPED`.
- Existing employer survey responses contain only survey and employer identity, not skill/proficiency or curriculum feedback.
- No employer curriculum validation or consultation-event evidence table exists.
- Existing demand history is represented by dated `industry_demand` rows; no additional trend table is justified.

## Phase 6 Entities Added

1. `data_ingestion_runs`: source, lifecycle timestamps/status, record counters, and bounded error summary.
2. `raw_job_postings`: source-scoped external ID, raw structured fields, normalized mapping status, canonical job posting link, and provenance.
3. `ingestion_rejected_records`: bounded rejection reason and raw payload per ingestion run.
4. `job_role_aliases`: curated normalized title aliases mapped to canonical roles.
5. `industry_consultations`: consultation event, participating employer, district, and evidence fields.
6. `employer_curriculum_validations`: employer evidence against course/curriculum version with neutral validation status and feedback.

No trend, forecast, or score table is added. Historical demand uses existing dated aggregate rows.

## Deterministic Rules

- Skill normalization: case/whitespace/punctuation-normalized exact canonical skill name or curated alias; otherwise `UNMAPPED`.
- Role normalization: case/whitespace/punctuation-normalized exact canonical role title or curated `job_role_aliases`; otherwise `UNMAPPED`. No fuzzy auto-merge is performed.
- Job ingestion idempotency: unique `(source_id, external_id)`; duplicate records are reported and do not create demand.
- Accepted raw jobs are promoted only when canonical employer, district, role, and source references are supplied and valid.
- Data freshness: source/ingestion timestamps are exposed; status is `UNKNOWN` until a configured freshness threshold is approved.
- Historical demand trend: current versus previous persisted periods, with percentage change only when the previous value is greater than zero.

## Data-Dependent Capabilities

Employer skill/proficiency survey mapping, direct curriculum validation aggregation, emerging technology intelligence, forecasting, defensible oversupply, obsolete-course classification, and time-normalized capacity utilization remain `NOT_YET_AVAILABLE` unless sufficient source data and approved formulas are supplied. No autonomous policy decisions are generated.
