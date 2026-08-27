# SkillMitra Phase 6 Data Ingestion and Evidence

## Architecture

Phase 6 adds a controlled evidence layer over the existing FastAPI, SQLAlchemy, Alembic, and Supabase PostgreSQL architecture:

`approved source -> ingestion run -> raw record -> validation -> canonical mapping -> demand signal`

No arbitrary URL fetching, scraping, Supabase Auth, paid AI API, or LLM is introduced.

## Data Sources and Provenance

The existing `data_sources` table is reused and extended with optional URL, organization, and status metadata. `data_ingestion_runs` records source, timestamps, lifecycle, accepted/rejected/deduplicated counters, and bounded error summary. Raw job records retain source, run, external ID, original structured payload, normalization status, and canonical posting linkage.

## Job Ingestion

`POST /api/v1/ingestion/job-postings` accepts approved structured records only. A record must have an external ID, title, employer ID, district ID, canonical role ID or exact/curated title mapping, skill IDs, and proficiency ID. Accepted records create a canonical `job_postings` row, posting skills, and one demand signal per mapped skill. Invalid records are retained in `ingestion_rejected_records`; they do not abort the entire run.

No external URL is fetched, and no job-board scraper is implemented.

## Normalization

Skill normalization uses normalized exact canonical names and curated `skill_aliases`. Role normalization uses normalized exact canonical titles and curated `job_role_aliases`. Unknown values return `UNMAPPED`; fuzzy or ambiguous automatic role merges are deliberately excluded.

## Deduplication and Idempotency

Raw records use unique `(source_id, external_id)`. Repeating an ingestion with the same external ID increments the run's deduplicated count and creates no canonical posting or demand signal. Demand signals are also checked by posting and skill before insertion.

## Employer Surveys and Consultation

Existing employer survey tables remain canonical for survey identity. Phase 6 adds `industry_consultations` for dated employer consultation evidence. Current survey rows do not contain normalized skill/proficiency payloads, so automatic survey-to-demand mapping remains data-dependent.

## Employer Curriculum Validation

Employers can submit evidence against a course or curriculum version with neutral statuses such as `relevant`, `partially_relevant`, `outdated`, `missing_skills`, `proficiency_mismatch`, or `equipment_mismatch`. Government reads the evidence records. A single response does not classify a curriculum as obsolete.

## Historical Demand and Emerging Skills

Historical demand uses existing dated `industry_demand` rows and Phase 5 period filtering. A trend result requires comparable historical periods; no trend table or arbitrary threshold was added in this phase. Emerging technology intelligence is `NOT_YET_AVAILABLE` because no approved technology-trend source exists.

## Freshness

`GET /api/v1/government/data-freshness` exposes source update timestamps and ingestion timestamps where available. Freshness is `UNKNOWN` until a configurable threshold is approved; no unexplained stale/fresh claim is emitted.

## Rejected Records

Rejections preserve a run ID, record key, reason code, bounded detail, and raw payload. Typical codes include `missing_external_id`, `missing_title`, `invalid_employer`, `unmapped_role`, `missing_district`, and `missing_skill_mapping`.

## Unsupported Capabilities

- Automatic employer survey skill/proficiency extraction: **NOT_YET_AVAILABLE**.
- Emerging technology trends: **NOT_YET_AVAILABLE**.
- Forecasting: **NOT_YET_AVAILABLE**; no validated historical series/model comparison exists.
- Oversupply and obsolete-course detection: **NOT_YET_AVAILABLE**; capacity greater than demand is insufficient evidence.
- Time-normalized capacity utilization: **NOT_YET_AVAILABLE**; capacity has no period/batch dimension.
- Autonomous government policy: **NOT_YET_AVAILABLE**; outputs remain decision support.

## Privacy and Security

Only approved structured data is accepted. No arbitrary URL retrieval is supported. Government ingestion and analytics endpoints require `government_admin`. Employer consultation and curriculum validation require the authenticated employer to own the supplied employer ID. Candidate and provider ownership rules remain unchanged. Raw payloads are not public endpoints.

## Libraries and LLM Decision

Only existing Python, FastAPI, Pydantic, SQLAlchemy, and PostgreSQL capabilities are used. No new normalization or AI library was necessary. LLM usage: **NOT USED**. External API cost: **$0**.
