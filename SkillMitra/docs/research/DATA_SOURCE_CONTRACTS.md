# SkillMitra Data Source Contracts (Phase 6.3)

Status: **READ-ONLY SPECIFICATION**. No ingestion, no schema change, no migration.
Author: SkillMitra Phase 6.3. Date: 2026-08-28.
Source-of-truth: `docs/research/PHASE_6_2_DATA_SOURCES.md`.

This document defines the **formal contract** every approved import must satisfy. It
applies to the two CONDITIONAL-GO sources (MSSDS Course Master, MSSDS Training Centre) and
to any future approved source.

---

## 1. Required provenance fields (per record / per run)

Every imported record must be accompanied by, and traceable to, all of the following:

| # | Field | Applies to | Required |
|---|---|---|---|
| 1 | source organization | record | yes |
| 2 | official source URL | data source | yes |
| 3 | retrieval date | run | yes |
| 4 | source record ID | record | yes |
| 5 | source file name (where applicable) | run | when file-based |
| 6 | file / API version (where applicable) | run | when versioned |
| 7 | ingestion run ID | record | yes |
| 8 | transformation version | record | yes |
| 9 | mapping status | record | yes |
| 10 | validation status | record | yes |

- **source organization / URL** → `data_sources.organization`, `data_sources.source_url`.
- **retrieval date / file name / file version** → `data_ingestion_runs` metadata (note: no
  dedicated columns exist for file name/hash/retrieval date on `data_ingestion_runs`; this
  is a documented gap — see §5).
- **source record ID / transformation version / mapping status / validation status** →
  raw staging record (`raw_job_postings` for jobs; a parallel raw record is required for
  courses/providers; such dedicated raw staging tables are a documented gap — see §5).

---

## 2. `INSUFFICIENT_EVIDENCE` rule

- If **any required provenance field is missing** for a record, the record is classified
  **`INSUFFICIENT_EVIDENCE`** — it is **not** promoted to a canonical row and creates **no**
  demand/signal/course/provider record.
- **Never derive unsupported values.** No rounding, no inferred district, no invented sector,
  no guessed version, no fabricated source ID. If a value cannot be obtained faithfully,
  store `NULL` (where the schema allows) or reject the record.

---

## 3. Mapping status values

`pending`, `mapped`, `unmapped`, `insufficient_evidence`, `rejected`

## 4. Validation status values

`pending`, `valid`, `invalid`, `insufficient_evidence`, `rejected`

---

## 5. Documented schema gaps for the contract

The following fields are **required by the contract** but are **not fully representable**
in the current schema (documented for future review, **not implemented**):

| Contract field | Current representation | Gap |
|---|---|---|
| source file name | `data_ingestion_runs` (no column) | add `source_file_name` |
| source file hash | (none) | add `source_file_hash` |
| retrieval date | `data_ingestion_runs.started_at` (approx.) | add `retrieved_at` |
| transformation version | (none) | add `transformation_version` on raw records / runs |
| mapping status (courses/providers) | only `raw_job_postings.normalization_status` exists | add course/provider raw staging or a status column |
| validation status (courses/providers) | (none) | add |

These are **documented only**; no migration is created in this phase.

---

## 6. Contract by source

### 6.1 MSSDS Course Master

**Data source:** `data_sources` row with organization = **MSSDS**,
`source_url` = course master page, `source_category` = course reference.
**Record identity:** `(data_source_id, source_course_code, source_version)`.
**Required record fields:** source_course_code, title, qualification, cost_category,
rate_per_hour, nsqf_level, nqr_code, source_version, industry_sector_id (only if a
reviewed sector master exists), data_source_id, ingestion_run_id,
source_record_identifier, transformation_version, mapping_status, validation_status.
**Rule:** any record missing source_course_code, title, or data_source_id →
`INSUFFICIENT_EVIDENCE`.

### 6.2 MSSDS Training Centre

**Data source:** `data_sources` row with organization = **MSSDS**,
`source_url` = training centre directory, `source_category` = training provider.
**Record identity:** `(name + district_id)` or `registration_number`.
**Required record fields:** provider name, district_id (exact canonical match), data_source_id,
ingestion_run_id, transformation_version, mapping_status, validation_status.
**Rule:** provider without a resolvable district_id or without a linked `training_providers`
identity → `INSUFFICIENT_EVIDENCE`. Course mappings in `course_offerings` require a resolved
canonical `course_id`.

---

## 7. Validation rules (consolidated, see readiness docs)

**Course Master** (`MSSDS_COURSE_MASTER_IMPORT_READINESS.md` §14):
- course code uniqueness `(source, code, version)`
- NQR code validation where present
- version preservation
- NSQF level validation (integer ≥ 0; decimal → `INSUFFICIENT_EVIDENCE`)
- duration validation (non-negative integer hours; unit confirmed)
- qualification preservation
- duplicate detection (conflict → block)

**Training Centre** (`MSSDS_TRAINING_CENTRE_IMPORT_READINESS.md` §13):
- provider identity resolvable
- district maps to canonical Maharashtra district (exact match)
- duplicate provider detection
- course mapping validation
- contact information handling (privacy)
- provenance

---

## 8. Non-negotiable rules

1. No scraping; no crawler; only documented APIs or captured official structured files.
2. No invented statistics; no derived sector/district/proficiency/skill.
3. Absent a required provenance or material field → `INSUFFICIENT_EVIDENCE`, never promote.
4. Preserve source values verbatim unless a validated, documented transformation exists.
5. Idempotent and deduplicated by source-scoped identity; conflicting duplicate values block
   the run.
6. No schema/migration/API/dependency change in this phase.
