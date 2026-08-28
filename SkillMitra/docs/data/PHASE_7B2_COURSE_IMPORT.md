# Phase 7B-2 Course Master Evidence Import

## Source Evidence

The original files are retained unchanged in `database/`:

| File | Format | Rows | SHA-256 |
| --- | --- | ---: | --- |
| `Ncvt_Courses_list_27-08-26_01_09_18.xls` | TSV content with `.xls` extension | 2 | `e319b0097a9bd3964a3412fc6017f1ac42d29b2215688650ca41b13c5f296982` |
| `Ncvt_Courses_list_27-08-26_01_11_48.xls` | TSV content with `.xls` extension | 7 | `2c0922ffddd839c9035d3ae1f1dae1037def8bb8f5e4647c2cdae49112a6c819` |

Source URL and retrieval date are not available in the local evidence package. Import provenance therefore records the local source filename and row number as `source_record_identifier`.

## Import Rules

- The exact TSV header order must match `Sr No.`, `Sector`, `Course Code`, `Course Name`, `Qualification`, `Course Duration`, `Cost Category`, `Rate Per Hour`, `NSQF Level`, `NQR Code`, `Version`.
- Records are identified by `Course Code + Version`.
- The later export must be a strict superset of the earlier export by `Course Code + Version`.
- If the same identity appears in both exports with contradictory material values, the import is blocked before any database session is opened.
- `Sr No.` is treated as source row order/provenance and is not a material course value.
- `-` and blank values become `NULL` where the target column is nullable.
- Sector matching is exact after whitespace normalization and case folding. Unmapped sectors remain `NULL` and are counted.
- Duplicates are not silently overwritten. Duplicate `Course Code + Version` or `NQR Code + Version` conflicts are rejected before insertion.
- Existing DB rows from the same data source are skipped only when the imported source fields are identical. Otherwise the run is blocked.

## Current Dry Run Result

The current evidence is blocked and no rows are inserted.

Shared course/version rows have contradictory values:

| Course Code | Version | Conflicting Fields |
| --- | --- | --- |
| `RSC_Q8001` | `3` | `Course Duration` is `450` vs `420`; `Cost Category` is `I` vs `-` |
| `RSC_Q8004` | `3` | `Course Duration` is `450` vs `420`; `Cost Category` is `I` vs `-` |

Dry-run counters for the current evidence:

| Counter | Value |
| --- | ---: |
| received | 7 |
| accepted | 0 |
| rejected | 0 |
| deduplicated | 0 |
| inserted | 0 |

Because the source contradiction is detected before database access, this phase cannot complete a data import until an authoritative corrected source export is supplied.

## Commands

Dry run:

```powershell
cd backend
python audit_courses.py
```

Machine-readable report:

```powershell
cd backend
python audit_courses.py --json
```

Actual insertion, only after source audit and DB identity checks pass:

```powershell
cd backend
python audit_courses.py --import
```
