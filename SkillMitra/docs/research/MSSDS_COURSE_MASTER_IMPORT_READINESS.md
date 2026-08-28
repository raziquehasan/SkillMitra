# MSSDS Course Master — Import Readiness

Status: **READ-ONLY PREPARATION**. No schema change, no migration, no import.
Author: SkillMitra Phase 6.3. Date: 2026-08-28.
Source-of-truth: `docs/research/PHASE_6_2_DATA_SOURCES.md` (CONDITIONAL-GO).

---

## 1. Existing `courses` table fields

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `id` | UUID PK | no | generated |
| `district_id` | FK `districts` | yes | SET NULL |
| `title` | String(300) | **no** | course name |
| `description` | Text | yes | |
| `status` | String(20) | no | `active`/`draft`/`archived` |
| `duration_hours` | Integer | yes | |
| `training_level` | String(50) | yes | |
| `delivery_mode` | String(20) | yes | `in_person`/`online`/`hybrid` |
| `source_course_code` | String(100) | yes | |
| `qualification` | Text | yes | |
| `cost_category` | String(50) | yes | |
| `rate_per_hour` | Numeric(10,2) | yes | |
| `nsqf_level` | Integer | yes | |
| `nqr_code` | String(150) | yes | |
| `source_version` | String(50) | yes | |
| `industry_sector_id` | FK `industry_sectors` | yes | RESTRICT |
| `data_source_id` | FK `data_sources` | yes | RESTRICT |
| `ingestion_run_id` | FK `data_ingestion_runs` | yes | RESTRICT |
| `source_record_identifier` | String(255) | yes | |
| `source_updated_at` | DateTime(tz) | yes | |

Key constraints:
- `uq_courses_source_course_code`: unique `(data_source_id, source_course_code)`
- `uq_courses_source_nqr_version`: unique `(data_source_id, nqr_code, source_version)`
- checks: `nsqf_level >= 0`, `rate_per_hour >= 0`, `status`, `delivery_mode`

---

## 2. MSSDS Course Master fields (detected columns)

`Sr No.`, `Sector`, `Course Code`, `Course Name`, `Qualification`, `Course Duration`,
`Cost Category`, `Rate Per Hour`, `NSQF Level`, `NQR Code`, `Version`

---

## 3. Field-by-field mapping

| MSSDS field | `courses` target | Status |
|---|---|---|
| Course Code | `source_course_code` (String 100) | **SUPPORTED** |
| Course Name | `title` (String 300, NOT NULL) | **SUPPORTED** |
| Qualification | `qualification` (Text) | **SUPPORTED** |
| Course Duration | `duration_hours` (Integer) | **PARTIAL** — requires numeric parse; unit (hours) must be confirmed; non-numeric → NULL |
| Cost Category | `cost_category` (String 50) | **SUPPORTED** |
| Rate Per Hour | `rate_per_hour` (Numeric 10,2) | **PARTIAL** — `-`/blank → NULL; decimal parse required |
| NSQF Level | `nsqf_level` (Integer) | **PARTIAL** — `-`/blank → NULL; **decrement NSQF values (e.g. 4.5) cannot be stored** |
| NQR Code | `nqr_code` (String 150) | **SUPPORTED** |
| Version | `source_version` (String 50) | **SUPPORTED** |
| Sector | `industry_sector_id` (FK) | **BLOCKED** — requires an `industry_sectors` master lookup; no source-sector column on `courses`; master currently empty |
| Sr No. | `source_record_identifier` (String 255) | **SUPPORTED** (as provenance/row order, not material) |

---

## 4. Missing fields

- **Sector code / sector name** — no column; sector only via `industry_sector_id` FK.
- **Fiscal year / valid period** — no FY/period column; the export is FY-scoped.
- **Source file name** — no `source_file_name` column.
- **Source file SHA-256** — no `source_file_hash` column.
- **Retrieval date** — `source_updated_at` exists but is not a retrieval timestamp; no `retrieved_at` column.
- **Export request metadata / permission statement** — no column.

---

## 5. Conflicting fields (schema vs. import rules)

1. **Identity conflict.** Documented import identity = **`(Course Code, Version)`**. The schema
   enforces `uq_courses_source_course_code` = `(data_source_id, source_course_code)` — **no
   version**, so two versions of the same course code from one source cannot coexist.
   The alternate constraint `uq_courses_source_nqr_version` only applies when `nqr_code`
   **and** `source_version` are both non-null. **CONFLICTING.**
2. **Ambiguous identity.** Two unique constraints exist (`source_course_code` vs.
   `nqr_code + version`); it is not clear which is canonical for deduplication. **CONFLICTING.**
3. **Source-level contradiction.** The two supplied exports disagree on shared
   `(Course Code, Version)`: `RSC_Q8001` v3 → Duration `450` vs `420`, Cost Category `I` vs `-`;
   `RSC_Q8004` v3 → same pattern. This is a **source** contradiction, not a schema issue. **BLOCKED.**

---

## 6. Identity strategy

- **Intended:** `(data_source_id, source_course_code, source_version)` — i.e. Course Code + Version per source.
- **Schema-enforced (current):**
  - `(data_source_id, source_course_code)` unique — treats course code as version-agnostic.
  - `(data_source_id, nqr_code, source_version)` unique — only when NQR + version present.
- **Conclusion:** The schema cannot represent **multiple versions of the same course code**
  from one source under the documented identity. **BLOCKED** — must be resolved before import.

---

## 7-11. Field handling

- **Course code:** store verbatim in `source_course_code`; non-empty; no transformation. `-`/blank → reject (course code is required for identity).
- **NQR code:** store verbatim in `nqr_code`; `-`/blank → NULL; validate a known NQR format when present; never derive.
- **Version:** store verbatim in `source_version`; must be paired with course code; `-`/blank → NULL.
- **NSQF level:** store integer ≥ 0; `-`/blank → NULL; **decimal NSQF values are `INSUFFICIENT_EVIDENCE`** (never round/derive) → blocked unless a String column is added.
- **Qualification:** preserve verbatim; never truncate or normalize semantically.

---

## 12. Source provenance requirements

Each record must carry (into `data_sources`, `data_ingestion_runs`, and the record):
organization (**MSSDS**), official source URL, retrieval date, source record ID,
source file name, file/API version, ingestion run ID, transformation version,
mapping status, validation status. `data_source_id`, `ingestion_run_id`,
`source_record_identifier`, and `source_updated_at` exist on `courses`;
file-name/hash/retrieval-date/permission fields are **not** fully representable (see §4).

---

## 13. Required official export metadata

1. Exact source URL (course master page).
2. Retrieval timestamp.
3. Fiscal year / period of the export.
4. Export request / any login context.
5. Original filename.
6. File bytes / SHA-256 hash.
7. Exact header order and export version.
8. Any permission/licence statement.
9. Confirmed export format (TSV-with-`.xls` vs. real XLSX).

---

## 14. Required validation rules

- **Course code uniqueness:** identity `(source, course code, version)` must be unique; two records with identity conflict on material values → block the run.
- **NQR code validation:** non-empty → format check when a pattern is known; `-`/blank → NULL; never derive.
- **Version preservation:** store verbatim; no coercion.
- **NSQF level validation:** integer ≥ 0; `-`/blank → NULL; decimal → `INSUFFICIENT_EVIDENCE` (block).
- **Duration validation:** parse to non-negative integer **hours** after confirming unit; non-numeric → NULL; negative → reject; unit ambiguity → block.
- **Qualification preservation:** verbatim; no truncation/normalization.
- **Duplicate detection:** identical `(source, code, version)` with identical material values → dedupe; with conflicting values → block before any DB session is opened.

---

## 15. Exact reason the current import is blocked

1. **Source contradiction** — the supplied exports disagree on shared `(Course Code, Version)` rows (`RSC_Q8001`, `RSC_Q8004`): duration and cost category differ.
2. **Schema identity conflict** — `uq_courses_source_course_code` forbids two versions of one course code, but the approved identity is `(Course Code, Version)`.
3. **Sector mapping blocked** — no source-sector column; `industry_sectors` master appears empty; mapping would require inventing sector records.
4. **Provenance incomplete** — no confirmed official export request metadata, file hash, retrieval date, or permission statement; and `courses` cannot store file name/hash.
5. Minor: NSQF **decimal** values are not representable; Duration **unit** is ambiguous.

---

## 16. Minimal schema changes required later (documentation only — NOT implemented)

1. Replace `uq_courses_source_course_code` with a composite unique `(data_source_id, source_course_code, source_version)` to allow versioned course codes.
2. Add a source-sector reference (e.g. `source_sector_code`/`source_sector_name`) OR seed a reviewed `industry_sectors` master plus a mapping table; do not invent.
3. Add `source_file_name`, `source_file_hash`, `retrieved_at`, and a FY/`valid_period` column for complete provenance.
4. If decimal NSQF values occur, add a String NSQF column (or a reference) rather than forcing into `Integer`.
5. Add a reviewed `course_role`/course-to-role mapping only if/when job-role linkage is required.
