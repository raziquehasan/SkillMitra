# Maharashtra Data Pipeline

## Current Status

The pipeline is implemented. The live Supabase database contains the official Maharashtra state and 36-district geography master, while other master and evidence tables remain empty. No fabricated Maharashtra records were added.

## Source and Legality

Use Maharashtra Government, Government of India, approved employer, approved API, licensed, or officially published sources whose structured transformation is permitted. Do not scrape restricted job portals or fetch arbitrary URLs.

## Controlled Flow

`approved source -> data_sources -> data_ingestion_runs -> raw_job_postings -> validation -> canonical role/skill -> job_postings -> demand_signals -> industry_demand -> supply/outcomes -> district planning`

Rejected records are retained in `ingestion_rejected_records`. Raw records preserve source and run provenance.

## Screenshot Assessment

The supplied image contains sector skill council training counts for enrolled, trained, passed, and certified candidates. It lacks district, role, skill, employer, source record ID, source reference, and retrieval metadata. It cannot support the requested District -> Skill -> Demand chain and was not imported.

## Normalization and Deduplication

Canonical skills come from `skills` and curated aliases from `skill_aliases`. Canonical roles come from `job_roles` and curated aliases from `job_role_aliases`. Unknown mappings remain `UNMAPPED`. Job ingestion is idempotent on `(source_id, external_id)`.

## Calculations

- Demand values come only from persisted `industry_demand` rows.
- Available capacity is `max(active_seats - utilized_seats, 0)`.
- Capacity gap is `demand - available_capacity` only where both values have a defined scope.
- Placement rate is `placements linked to completed enrollments / completed enrollments` only when the denominator is positive.
- Historical change is `current_period - previous_period`; percentage change requires previous demand greater than zero.

## Current Coverage

States: 1 record. Maharashtra districts: 36 records. Roles: zero records. Skills: zero records. Courses: zero records. Providers: zero records. Demand signals: zero records. Placements: zero records. Employer validation: zero records. Phase 6 ingestion evidence: zero records.

Status: geography **IMPLEMENTED**; real Maharashtra intelligence remains **NOT_YET_AVAILABLE** until approved roles, skills, courses, providers, and evidence are imported.
