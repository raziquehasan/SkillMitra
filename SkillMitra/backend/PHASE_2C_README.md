# SkillMitra Phase 2C - Data Sources, Industry Sectors, Employer Surveys & Labour-Market Demand Intelligence

## Phase 2C Scope
This phase establishes the final transactional and analytical database foundations connecting the industry, employers, job market signals, and demand analytics.

## Implemented Tables
- `industry_sectors` (Reference)
- `data_sources` (Operational/Provenance)
- `employer_surveys` (Transactional)
- `employer_survey_responses` (Transactional)
- `demand_signals` (Staging/Transactional)
- `industry_demand` (Analytical/Derived)

## Deferred Phase 2B FKs Added
- Added `industry_sector_id` to `employers` mapping to `industry_sectors.id`
- Added `data_source_id` to `job_postings` mapping to `data_sources.id`

## Migration Details
- Migration 1: `02d6674f9534_phase2c_demand_intelligence` (Creates Phase 2C entities and adds data_source_id to job_postings)
- Migration 2: `c5a538c2c5a6_phase2c_add_employer_fk` (Adds industry_sector_id to employers)

## How to Verify Alembic
Run:
```bash
alembic upgrade head
alembic check
```
Expected output: `No new upgrade operations detected.`

## How to Run Tests
```bash
pytest tests/test_db_phase2a.py -v
pytest tests/test_db_phase2b.py -v
pytest tests/test_db_phase2c.py -v
```

## Maharashtra Geography Handling
Districts are strictly preserved as database records in the existing `districts` table (Group B - Geography). Demand signals and industry demand records are explicitly mapped to the Maharashtra geography model using direct `district_id` foreign keys, avoiding any hardcoded city strings or secondary geography master tables.

## Demand Signal Architecture
Demand signals originate from exactly one raw source: either a `job_posting_id` or a `survey_response_id`. This is strictly enforced at the database level using a PostgreSQL CHECK constraint:
`(((job_posting_id IS NOT NULL) AND (survey_response_id IS NULL)) OR ((job_posting_id IS NULL) AND (survey_response_id IS NOT NULL)))`
This ensures exactly one source per demand signal record without relying on complex polymorphic relationships.

*(Note: No web scraping or live data ingestion exists in Phase 2C. This phase establishes the database foundation required for those future capabilities.)*
