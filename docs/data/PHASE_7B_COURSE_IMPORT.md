# Phase 7B Course Master Import Validation

## Status

`BLOCKED_SCHEMA_GAP`

This is a read-only validation report prepared before insertion. No course rows were inserted, no existing course was modified, and the original `.xls` files were not changed.

## Source Files

Both supplied files have an `.xls` extension but their first bytes are plain tab-separated text (`Sr No.\t Sector...`), not an OLE/BIFF or XLSX workbook.

- `database/Ncvt_Courses_list_27-08-26_01_11_48.xls`: 2,649 bytes, 7 data rows, SHA-256 `2C0922FFDDD839C9035D3AE1F1DAE1037DEF8BB8F5E4647C2CDAE49112A6C819`.
- `database/Ncvt_Courses_list_27-08-26_01_09_18.xls`: 1,266 bytes, 2 data rows, SHA-256 `E319B0097A9BD3964A3412FC6017F1AC42D29B2215688650CA41B13C5F296982`.

The larger export contains the two rows visible in the smaller export plus five additional rows. It is the candidate complete export, but the original source filename and both files must be preserved for provenance.

## Source Columns Detected

1. `Sr No.`
2. `Sector`
3. `Course Code`
4. `Course Name`
5. `Qualification`
6. `Course Duration`
7. `Cost Category`
8. `Rate Per Hour`
9. `NSQF Level`
10. `NQR Code`
11. `Version`

## Read-Only Validation Findings

For the larger 7-row export:


The existing `courses` table was inspected before the schema design. The current live Supabase count after migration is 0; no course rows were inserted by Phase 7B or Phase 7B-1.

## Intended Mapping

| Source column | Intended target | Current status |
|---|---|---|
| Course Code | Authoritative external course identity | Missing from `courses` |
| Course Name | `courses.title` | Supported |
| Qualification | Course qualification/source metadata | Missing from `courses`; cannot discard |
| Course Duration | `courses.duration_hours` | Supported after numeric parsing |
| Cost Category | Course source metadata | Missing from `courses` |
| Rate Per Hour | Course source metadata | Missing from `courses` |
| NSQF Level | Course source metadata | Missing from `courses`; `-` must remain unknown |
| NQR Code | External qualification reference | Missing from `courses` |
| Version | External source version | Missing from `courses` |
| Sector | `industry_sectors` relationship | Cannot resolve while sector master is empty |
| Source filename/hash/run | `data_sources` / `data_ingestion_runs` | Existing tables support provenance, but no course-source link exists |

## Exact Blocker

The current SQLAlchemy/Supabase `courses` schema cannot preserve the authoritative Course Code, NQR Code + Version, qualification text, cost category, rate per hour, NSQF value, source file identity, or industry-sector mapping. Importing only the title and duration would lose source identity and authoritative metadata, making deterministic deduplication and auditability impossible. Creating a course using the title alone would also risk duplicate or incorrect canonical records.

Per the import rules, no guessed migration and no partial production import was performed. A reviewed additive schema change is required before import, or the export must be supplied with a mapping to an already approved course-reference table.

## Maharashtra Restriction

This export is a national/official course reference. It does not establish Maharashtra district availability, training providers, course offerings, capacity, demand, utilization, placement, or employer evidence. None of those tables were populated.

## Provenance and Access

The source page is the MSSDS/Kaushalya Course Master page:

`https://www.kaushalya.mahaswayam.gov.in/users/coursemasters`

The page shows an official `Export to excel` control and FY selection. The supplied files are local exports. Retrieval timestamp, export request metadata, and any licence/permission statement were not embedded in the files and must be recorded by the data owner before production import.

## Commands Used

- `Get-ChildItem database -File`
- `Format-Hex database/Ncvt_Courses_list_*.xls -Count 32`
- `Get-Content database/Ncvt_Courses_list_*.xls -TotalCount 8`
- `Get-FileHash database/Ncvt_Courses_list_*.xls -Algorithm SHA256`
- SQLAlchemy inspector against the active Supabase `courses` and `industry_sectors` tables

## Decision

`IMPORT_BLOCKED_PROVENANCE` and `INSUFFICIENT_EVIDENCE` for production course records until:

1. The exact export hashes and retrieval metadata are recorded.
2. The course-reference schema can preserve all required authoritative fields.
3. Sector master records or an approved sector mapping are available.
4. An idempotent importer is validated against Course Code and NQR Code + Version.

No Phase 8 work, ML, LLM extraction, scraping, provider creation, district availability, or Maharashtra-specific analytics was started.
