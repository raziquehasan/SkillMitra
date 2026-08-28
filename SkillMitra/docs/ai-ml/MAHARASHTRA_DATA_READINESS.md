# Maharashtra Data Readiness

## Audit Date

2026-08-27. Repository is on `main` at the Phase 6 implementation commit. Supabase PostgreSQL is reachable and the Phase 6 schema is applied.

## Live Supabase Inventory

The following tables were checked and currently contain zero rows:

- `states`: 1 row (`Maharashtra`); `districts`: 36 rows linked to Maharashtra
- `industry_sectors`, `job_roles`, `skills`, `skill_aliases`, `skill_proficiency_levels`
- `courses`, `training_providers`, `course_offerings`, `trainers`, `trainer_skills`, `equipment`
- `employers`: 0 rows; `data_sources`: 1 government source row
- `job_postings`, `job_posting_skills`, `demand_signals`, `industry_demand`
- `course_enrollments`, `applications`, `placements`
- `data_ingestion_runs`, `raw_job_postings`, `ingestion_rejected_records`
- `industry_consultations`, `employer_curriculum_validations`

## Maharashtra Geography

The schema correctly uses `states` to `districts` through `districts.state_id`. The official Planning Department district listing was imported through the controlled seed. Status: **IMPLEMENTED** for geography master data. District codes remain NULL because the source page does not publish official codes; no codes were inferred and no second geography table was created.

Required master input:

```csv
external_id,state_name,state_code,district_name,district_code
```

## Supplied Spreadsheet Image

The screenshot shows a worksheet with columns resembling:

- Sector Skill Council
- No. of Candidates Enrolled
- No. of Candidates Trained
- No. of Candidates Passed
- No. of Candidates Certified

The sheet tab appears to contain a session label similar to `Session2024...`. The image does not establish a source URL, issuing organization, retrieval date, source record IDs, Maharashtra scope, district, employer, job role, skill, proficiency, or ingestion run. It appears to be aggregate training-outcome data by sector council, not labour-market demand evidence.

Status: **NOT_IMPORTED**. It must not populate production tables or demand signals. A screenshot is not sufficient provenance and cannot support district intelligence.

## Existing Evidence

No real Maharashtra job postings, employer survey responses, consultation records, demand signals, placement outcomes, provider capacity, trainer capability, or equipment inventory are present in the live database. Therefore the District X -> Skill Y intelligence chain is currently **NOT_YET_AVAILABLE** for real values, although the geography dimension is ready.

## Legitimate Source Requirements

Acceptable inputs include an official Maharashtra Government or Government of India dataset, an approved employer-provided file, an approved API, a licensed dataset, or an official report that permits structured transformation. Every import requires source organization, permitted URL/reference, retrieval/import date, source record ID, and ingestion run.

Restricted job-board scraping, arbitrary URLs, LinkedIn/Indeed/Naukri extraction, CAPTCHA bypass, robots.txt bypass, and unauthorised portal access are not permitted.

## Import Formats

### Approved job evidence

```json
{
  "external_id": "source-record-id",
  "employer_id": "canonical-employer-uuid",
  "district_id": "canonical-district-uuid",
  "job_role_id": "canonical-role-uuid",
  "skill_ids": ["canonical-skill-uuid"],
  "proficiency_level_id": "canonical-proficiency-uuid",
  "title": "canonical source title",
  "posted_date": "YYYY-MM-DD"
}
```

### Master data

Use external IDs and names/codes for states, districts, employers, industry sectors, roles, skills, aliases, courses, and providers. Resolve to canonical UUIDs through deterministic validation before ingestion.

### Screenshot outcome data

If legally approved and needed, the original spreadsheet file must be supplied with source metadata and a schema mapping. The current columns can support sector-level training counts only; they cannot be converted into district demand, skill demand, role demand, capacity, or placement rates without additional keys and evidence.

## Readiness Classification

- Schema and ingestion APIs: **IMPLEMENTED**.
- Supabase connection and Phase 6 tables: **SUPPORTED BY CURRENT SYSTEM**.
- Maharashtra geography master data: **IMPLEMENTED** (1 state, 36 districts).
- Other Maharashtra master data and evidence: **NOT_YET_AVAILABLE**.
- Real district demand, supply, trainer/equipment gaps, placement, and employer validation: **NOT_YET_AVAILABLE**.
- Screenshot import: **NOT_IMPORTED** pending provenance and structured source file.
- Demo data: none created and none mixed with production analytics.
