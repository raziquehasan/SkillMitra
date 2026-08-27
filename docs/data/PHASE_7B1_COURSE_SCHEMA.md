# Phase 7B-1 Course Master Schema Extension

## Status

Schema extension design approved for implementation. This phase does not import the MSSDS Course Master rows and does not create sector, district, provider, offering, capacity, demand, or placement records.

## Existing Schema

The existing `courses` table contains UUID identity, title, description, status, duration in hours, delivery mode, optional district, and timestamps. The live Supabase database currently contains 2 course rows. `industry_sectors` is empty. Existing provenance tables are `data_sources` and `data_ingestion_runs`.

## Exact Additive Migration

Modify only `courses` by adding nullable columns:

| Column | Type | Purpose |
|---|---|---|
| `source_course_code` | `VARCHAR(100)` | Official source course identity, e.g. `RSC_Q8001` |
| `qualification` | `TEXT` | Original qualification text, unchanged |
| `cost_category` | `VARCHAR(50)` | Source cost category; null marker `-` becomes NULL |
| `rate_per_hour` | `NUMERIC(10,2)` | Parsed decimal source rate |
| `nsqf_level` | `INTEGER` | Parsed level; source `-` remains NULL |
| `nqr_code` | `VARCHAR(150)` | NQR reference |
| `source_version` | `VARCHAR(50)` | Source version, retained separately from NQR code |
| `industry_sector_id` | UUID nullable FK | Canonical sector mapping when available |
| `data_source_id` | UUID nullable FK | Source registry link |
| `ingestion_run_id` | UUID nullable FK | Import-run provenance link |
| `source_record_identifier` | `VARCHAR(255)` | Original source record key, normally Course Code |
| `source_updated_at` | `TIMESTAMP WITH TIME ZONE` | Source update timestamp where supplied |

Existing course rows remain valid because all new columns are nullable. No existing values are overwritten.

## Constraints and Indexes

- Unique `(data_source_id, source_course_code)` for deterministic source-scoped identity. PostgreSQL NULL semantics allow legacy rows without source identity.
- Unique `(data_source_id, nqr_code, source_version)` for the secondary source identity when all values are available; null values remain unknown.
- Foreign keys use `RESTRICT` for source/sector/run references to protect provenance.
- Index `source_course_code` and the provenance columns for lookup and audit.
- `nsqf_level` is nullable and constrained to non-negative values when present.
- `rate_per_hour` is nullable and constrained to non-negative values when present.

## Provenance Design

`data_source → data_ingestion_runs → courses` is represented by the three nullable FKs. `source_record_identifier` preserves the row key. The original export remains outside the database at:

- `database/Ncvt_Courses_list_27-08-26_01_11_48.xls`
- `database/Ncvt_Courses_list_27-08-26_01_09_18.xls`

Their SHA-256 values and validation findings are recorded in [PHASE_7B_COURSE_IMPORT.md](PHASE_7B_COURSE_IMPORT.md). No source file is modified or overwritten.

## Sector Mapping

The source sector `PLASTIC PROCESSING` is not inserted into `industry_sectors` by this migration. Until a canonical sector reference exists, `industry_sector_id` remains NULL and the importer must report `UNMAPPED_SECTOR`.

## Deduplication

The importer will prefer `(data_source_id, source_course_code)`. If Course Code is absent, it will not fuzzy-match. The secondary `(data_source_id, nqr_code, source_version)` identity is retained for deterministic duplicate detection. Course title alone is never an authoritative identity.

## Maharashtra Restriction

This extension supports a national/official course reference. It does not derive Maharashtra district availability, provider records, offerings, seats, utilization, demand, or placements from the Course Master file.

## Migration Safety

Planned operations are additive `ALTER TABLE ... ADD COLUMN`, foreign-key creation, unique constraints, and indexes only. No DROP, TRUNCATE, DELETE, rename, or existing-row rewrite is planned.
