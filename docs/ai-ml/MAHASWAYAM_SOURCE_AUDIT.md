# Mahaswayam Source Audit

Audit date: 2026-08-27

This audit covers the official Maharashtra Government, MSSDS/Mahaswayam, and NSDC pages supplied for Phase 7A. No dashboard figures, screenshots, PDFs, or unverified web responses were imported into production evidence tables.

## Source Matrix

| Source | Official URL | Structured Data | Access | Period | Geography | Usable |
|---|---|---|---|---|---|---|
| Maharashtra 36 districts | https://plan.maharashtra.gov.in/en/36-districts/ | District names are presented as links to district PDFs; no machine-readable CSV/API observed | Public; PDFs open publicly | Page updated 08 Jul 2025; PDF periods must be inspected individually | Maharashtra; 36 district links visible | AVAILABLE_FOR_IMPORT for geography names only |
| Mahaswayam home | https://www.mahaswayam.gov.in/ | Navigation, notifications, reports and links; no public data API identified | Public HTML; linked PDFs public | Page last updated 27 Aug 2026 | Maharashtra/state-level | PARTIALLY_AVAILABLE |
| Skill Gap Study | https://www.mahaswayam.gov.in/skillgapstudy | One listed PDF: “Skill Gap Analysis Report FY 2023-24”; no CSV/XLSX/JSON/API observed | Public PDF link | FY 2023-24 | Maharashtra scope is stated by portal; district/field coverage requires PDF inspection | PDF_REFERENCE_ONLY |
| District Information Booklets | https://www.mahaswayam.gov.in/booklet | Year selector and booklet links; content is PDF/reference material, not tabular API | Public page; year selection | Year-dependent; exact selected year not captured | District booklets, coverage must be verified per file | PDF_REFERENCE_ONLY |
| MSSDS/Kaushalya | https://kaushalya.mahaswayam.gov.in/ | Public portal pages, notices, results and links; no verified public API identified | Public HTML; some operational functions have login | Current portal content; scheme periods vary | Maharashtra; MSSDS states PMKUVA covers all districts and NULM selected cities | PARTIALLY_AVAILABLE |
| MSSDS Course Master | https://www.kaushalya.mahaswayam.gov.in/users/coursemasters | Page exposes “Export to excel”; visible structured table includes FY, sector, course code, course title, eligibility, duration, NSQF-related values and certification fields | Public page; export control visible; actual file/API response not captured; login not indicated on page | FY selector; current page last updated 27 Aug 2026 | Maharashtra course master, not district demand | PROVENANCE_REQUIRED |
| MSSDS Training Centre directory | https://www.kaushalya.mahaswayam.gov.in/users/find_center | Searchable/paginated HTML directory; visible fields: scheme, sector, district, city, VTP name, address, phone, email, courses; 249 pages shown | Public directory; course list opens from UI; no stable export/API verified | Current directory; page copyright 2024; exact record dates not shown | Maharashtra districts/centres | PROVENANCE_REQUIRED |
| MSSDS Skill Gap Study link | https://www.kaushalya.mahaswayam.gov.in/users/skill_gap_study_report | Link to report page; structured download/API not verified | Public link; report access must be checked | Not established | Maharashtra scope not established from link alone | PDF_REFERENCE_ONLY |
| Rojgar Mahaswayam | https://rojgar.mahaswayam.gov.in/ | Public homepage displays aggregate counters and featured vacancies; jobseeker/employer workflows are login/registration oriented; no public API verified | Public HTML; Aadhaar/login is required for jobseeker workflows | Homepage counters are live/current and not a reproducible dataset | Maharashtra; vacancy examples show district names | PROVENANCE_REQUIRED |
| Government reports/notifications | https://www.mahaswayam.gov.in/view_notification and https://www.mahaswayam.gov.in/gr | Indexed notifications and government resolutions link to PDFs; no CSV/XLSX/JSON/API observed | Public pages and public PDF links | Each document has its own date; examples include 1995-2026 | Maharashtra/state or scheme-specific; inspect each document | PDF_REFERENCE_ONLY |
| NSDC home | https://www.nsdcindia.org/ | Public organizational/reference content; no Maharashtra dataset API identified | Public HTML | Current site content; copyright © 2026 | National; includes Maharashtra references but not district evidence | PARTIALLY_AVAILABLE |
| NSDC state-wise reports | https://stag-api.nsdcindia.org/state-wise-reports | Report index with downloadable PDF links; no tabular API observed | Public HTML/PDF links | Reports listed/updated with dates | State-level; not district-level by default | PDF_REFERENCE_ONLY |
| NSDC Maharashtra skill stock detail | https://stag-api.nsdcindia.org/estimating-skill-stock-maharashtra | Detail page exists, but currently links to `Estimating the Skill Stock in Madhya Pradesh_0.pdf` | Public page/PDF link | Submitted/updated 07 Aug 2025 | Claimed Maharashtra title; linked file is Madhya Pradesh | IMPORT_BLOCKED_PROVENANCE |

## Exact APIs and Exports Found

- No verified public JSON/REST API was identified on the reviewed pages.
- MSSDS Course Master visibly provides an `Export to excel` control. The actual export request, file, endpoint, and permission statement were not captured, so it remains `PROVENANCE_REQUIRED`.
- MSSDS Training Centre directory is publicly searchable and paginated to 249 pages, but no stable export/API was verified.
- Rojgar Mahaswayam exposes public aggregate counters and UI routes, but no approved structured employment API was verified.
- Government pages expose PDF links, not machine-readable datasets.

## Records Obtained

No original CSV/XLSX/JSON/Parquet file was obtained. No PDF was downloaded into the repository. No live dashboard or homepage counters were imported. The only approved production data action remains the earlier idempotent Maharashtra geography seed from the Planning Department district listing: 1 state and 36 districts.

## Coverage Status

- Districts: 36 official Maharashtra district names imported; district codes were not inferred.
- Skills: 0 canonical records in Supabase.
- Job roles: 0 canonical records in Supabase.
- Courses: 0 records in Supabase; MSSDS Course Master is a candidate source pending export capture.
- Providers/training centres: 0 records in Supabase; MSSDS directory is a candidate source pending lawful structured acquisition.
- Placement evidence: 0 records in Supabase.
- Demand evidence: 0 records in Supabase.
- Employer evidence: 0 records in Supabase.
- Phase 6 ingestion records: 0 records in Supabase.

## Import Decisions

### Safely importable now

- Official Maharashtra state/district names from the Planning Department page, with source provenance. This has already been seeded through `backend/app/seeds/maharashtra_master.py`.
- A verified MSSDS Course Master Excel export, once obtained through the visible official export and accompanied by source URL, retrieval date, FY, file hash, and permission/provenance confirmation.

### Not safe to import yet

- MSSDS training-centre records: public HTML is not a confirmed structured export/API; contact fields also require privacy review.
- MSSDS dashboard counters: presentation-only aggregates without reproducible export/provenance.
- Rojgar homepage counters or featured jobs: live UI values are not a stable dataset and may lack source-record metadata.
- Skill Gap Study and district booklets: PDF reference only until the original files, period, extraction method, and field mapping are preserved.
- NSDC Maharashtra skill-stock report: import blocked because the page title and linked PDF state do not match.
- Government notifications/resolutions: reference evidence only; do not convert policy text into demand or placement numbers.

## Required Provenance for Any Next Import

Each imported record or aggregate must identify source organization, official URL/reference, retrieval/import date, period/FY, source record ID where available, original file/API response, ingestion run, and transformation/mapping rules. If a field such as district, role, skill, proficiency, or source record ID is absent, classify the result as `INSUFFICIENT_EVIDENCE` rather than deriving a demand number.

## Final Classification

- Planning Department district master: `AVAILABLE_FOR_IMPORT` and already imported.
- MSSDS Course Master: `PROVENANCE_REQUIRED`.
- MSSDS Training Centre directory: `PROVENANCE_REQUIRED`.
- MSSDS dashboard/portal counters: `PARTIALLY_AVAILABLE`, not production evidence.
- Skill Gap Study and district booklets: `PDF_REFERENCE_ONLY`.
- Rojgar Mahaswayam: `PROVENANCE_REQUIRED` for structured employment data.
- Government reports/notifications: `PDF_REFERENCE_ONLY`.
- NSDC national reference: `PARTIALLY_AVAILABLE`.
- NSDC Maharashtra skill-stock detail: `IMPORT_BLOCKED_PROVENANCE`.
- Real district demand, skill demand, placement, provider capacity, and employer validation: `NOT_AVAILABLE` in the current database until approved structured evidence is supplied.
