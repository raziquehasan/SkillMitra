# Phase 6.2 — Official Data Source Research (Maharashtra / PS 26134)

Research date: 2026-08-28
Scope: Identify and classify **official, legally reusable** data sources that can
support SkillMitra's PS 26134 goals for **Maharashtra**. This is a read-only research
document. **No ingestion, scraping, schema change, migration, dependency, sample data,
or Phase 7 work is performed.**

> Note on method: a source is only treated as "machine-readable / usable" when an
> official **API** or a **structured file** (CSV/Excel/JSON) is documented or captured.
> Data merely visible in a browser is **not** treated as an API, and scraping is not
> assumed to be permitted. Where access or reuse terms are not established, the source
> is marked accordingly rather than assumed usable.

---

## 1. Evidence requirements (PS 26134)

| Code | Evidence |
|---|---|
| A | Job demand |
| B | Skills demand |
| C | Job roles |
| D | Sector demand |
| E | District demand |
| F | Courses |
| G | Training providers |
| H | Training capacity |
| I | Placement outcomes |
| J | Employer requirements |
| K | Industry consultations |
| L | Emerging skills / trends |

---

## 2. Source inventory & classification

| # | Source | Organization | Classification | Decision |
|---|---|---|---|---|
| 1 | Maharashtra Planning Department — 36 Districts | GoM Planning Dept | DIRECTLY USABLE (geography master only) | GO (geography master already imported) |
| 2 | MSSDS / Mahaswayam Course Master | MSSDS | USABLE WITH REGISTRATION/EXPORT | CONDITIONAL-GO (needs official export capture + schema fix) |
| 3 | MSSDS Training Centre directory | MSSDS | USABLE WITH REGISTRATION/APPROVAL | CONDITIONAL-GO (needs provenance + privacy approval + structured export) |
| 4 | Mssds Skill Gap Study / District Booklets | MSSDS | REFERENCE ONLY | NO-GO for demand inference (PDF reference) |
| 5 | Rojgar Mahaswayam | MSSDS / Govt. of Maharashtra | NOT USABLE | NO-GO (live counters, no provenance; login-gated) |
| 6 | NSDC (state-wise reports / skill stock) | NSDC | REFERENCE ONLY | NO-GO (PDF reference; MH skill-stock page provenance-mismatched) |
| 7 | NCS (ncs.gov.in / data.gov.in) | MoLE / DGE | NOT USABLE | NO-GO (documented in NCS_DATA_ACCESS.md) |
| 8 | Maharashtra Commissionerate of Economics & Statistics (DES) | GoM DES | REFERENCE ONLY (statistical context) | NO-GO for demand evidence; CONDITIONAL-GO only if a verified machine-readable export exists |
| 9 | Skill India Digital Hub (SIDH) | MSDE / Skill India | NOT USABLE (unverified) | CONDITIONAL-GO only after verification of a machine-readable API/export + reuse terms |
| 10 | Directorate General of Training (DGT) / NCVT MIS | DGT, MSDE | REFERENCE ONLY (aggregates/PDFs) | NO-GO for structured demand; CONDITIONAL-GO only if a verified machine-readable export exists |

---

## 3. Per-source detail

### 3.1 Maharashtra Planning Department — 36 Districts

- **Official URL:** https://plan.maharashtra.gov.in/en/36-districts/
- **Organization:** Government of Maharashtra, Planning Department
- **Data available:** Official state (`MH`) and 36 district names; districts are presented
  as links to district PDFs.
- **Machine-readable API?** No. No machine-readable CSV/API observed.
- **CSV/Excel/JSON download?** No (district names as links to per-district PDFs).
- **Authentication required?** No (public).
- **API key required?** No.
- **Update frequency:** Page noted as updated 08 Jul 2025; individual PDF periods vary.
- **Historical data:** Nominal — district names are a master, not a time series.
- **Maharashtra/district filtering:** Yes — this is the canonical state/district master
  (state `MH`, 36 official districts).
- **Relevant fields:** `state` (name, code `MH`), `district` (name); no official district
  codes published on this page.
- **Licence/reuse terms:** Government of Maharashtra official page; used previously for a
  controlled geography seed. Attribution via source URL is required.
- **Attribution requirements:** Record the source URL and retrieval date.
- **Automated retrieval permitted?** Public listing; already imported idempotently via
  `backend/app/seeds/maharashtra_master.py`.
- **Supports PS 26134:** Provides the canonical district reference for **E (district
  demand)**, **G (providers)**, **H (capacity)** mapping. It is **not** itself demand/skill
  evidence.
- **Go/No-Go:** **GO** — but only as an already-imported **geography master**, not as
  demand evidence.

---

### 3.2 MSSDS / Mahaswayam Course Master

- **Official URL:** https://www.kaushalya.mahaswayam.gov.in/users/coursemasters
- **Organization:** Maharashtra State Skill Development Society (MSSDS)
- **Data available:** FY selector; a visible structured table with sector, course code,
  course title, eligibility, duration, NSQF-related values and certification fields, plus
  an **"Export to excel"** control. (The locally supplied NCVT course exports are TSV
  files with an `.xls` extension.)
- **Machine-readable API?** No verified public JSON/REST API.
- **CSV/Excel/JSON download?** The page exposes an **Export to excel** control. The actual
  export request/file/API and any permission statement were **not captured**.
- **Authentication required?** Public page; login not indicated on the page.
- **API key required?** No.
- **Update frequency:** FY selector; page noted as last updated 27 Aug 2026.
- **Historical data:** FY-selectable, but historical exports were not captured for
  validation.
- **Maharashtra/district filtering:** State-level course reference; **not** district-level
  demand/availability.
- **Relevant fields (detected columns):** `Sr No.`, `Sector`, `Course Code`, `Course Name`,
  `Qualification`, `Course Duration`, `Cost Category`, `Rate Per Hour`, `NSQF Level`,
  `NQR Code`, `Version`.
- **Licence/reuse terms:** **Not established.** The export is a national/official course
  reference; no explicit reuse/permission statement was captured.
- **Attribution requirements:** Source filename, hash, retrieval date, export request
  metadata, and source URL must be recorded before any production import.
- **Automated retrieval permitted?** **Not verified.** The visible "Export to excel" is a
  UI control; it is not established that automated retrieval is permitted.
- **Supports PS 26134:** **F (Courses)** (and, indirectly, **B/D** via sector mapping).
  Does **not** establish Maharashtra district availability, providers, capacity, demand,
  utilization, placement, or employer evidence.
- **Current status in SkillMitra:** **IMPORT_BLOCKED_PROVENANCE** and
  **BLOCKED_SCHEMA_GAP** (see `docs/data/PHASE_7B_COURSE_IMPORT.md` and
  `PHASE_7B2_COURSE_IMPORT.md`). The provided exports contain contradictory
  course/version values and the `courses` table cannot preserve all authoritative fields.
- **Go/No-Go:** **CONDITIONAL-GO** — usable only after: (a) the **official** export is
  captured with full provenance, (b) a reviewed additive schema change preserves Course
  Code/NQR Code/Version/qualification/cost/rate/NSQF and the sector mapping, and
  (c) an idempotent importer validates identity. Until then it is **NOT USABLE**.

---

### 3.3 MSSDS Training Centre directory

- **Official URL:** https://www.kaushalya.mahaswayam.gov.in/users/find_center
- **Organization:** MSSDS
- **Data available:** Searchable/paginated HTML directory (≈249 pages) with scheme,
  sector, district, city, VTP name, address, phone, email, courses. Course list opens from
  the UI.
- **Machine-readable API?** No verified public API/export.
- **CSV/Excel/JSON download?** No stable export verified.
- **Authentication required?** Public directory; some operational functions may require
  login.
- **API key required?** No.
- **Update frequency:** Current directory; page copyright 2024; per-record dates not shown.
- **Historical data:** Not established (current snapshot only).
- **Maharashtra/district filtering:** Yes — directory is scoped to Maharashtra districts
  and cities.
- **Relevant fields:** scheme, sector, district, city, VTP name, address, phone, email,
  courses.
- **Licence/reuse terms:** **Not established.** Contact fields also require a privacy
  review before reuse.
- **Attribution requirements:** Source URL, retrieval date, and a permitted structured
  transformation must be recorded.
- **Automated retrieval permitted?** **Not verified** — page is paginated HTML; no stable
  export/API confirmed.
- **Supports PS 26134:** **G (Training providers)**, **H (Training capacity)**, and
  **F (Courses)** at district granularity.
- **Go/No-Go:** **CONDITIONAL-GO** — requires a verified structured export/API, full
  provenance, and a privacy review of contact fields. Until then **NOT USABLE**.

---

### 3.4 MSSDS Skill Gap Study / District Information Booklets

- **Official URLs:**
  - https://www.mahaswayam.gov.in/skillgapstudy
  - https://www.mahaswayam.gov.in/booklet
  - https://www.kaushalya.mahaswayam.gov.in/users/skill_gap_study_report
- **Organization:** MSSDS / Government of Maharashtra
- **Data available:** Skill Gap Analysis Report FY 2023-24 (PDF) and District Information
  Booklets (year selector). Policy/reference material, not tabular API.
- **Machine-readable API?** No.
- **CSV/Excel/JSON download?** No — PDF links only.
- **Authentication required?** Public.
- **Update frequency:** Period-dependent; each document has its own date.
- **Historical data:** Historical, but PDFs only.
- **Maharashtra/district filtering:** Maharashtra scope and district coverage stated by
  portal; exact coverage requires per-file inspection.
- **Relevant fields:** Report/booklet text — not a structured record schema.
- **Licence/reuse:** Reference evidence only; do not convert policy text into demand or
  placement numbers.
- **Supports PS 26134:** Qualitative context for **D/E**; not machine-readable evidence
  for **A/B/C/F/G/H/I**.
- **Go/No-Go:** **NO-GO** for structured demand inference — **REFERENCE ONLY**.

---

### 3.5 Rojgar Mahaswayam

- **Official URL:** https://rojgar.mahaswayam.gov.in/
- **Organization:** MSSDS / Govt. of Maharashtra
- **Data available:** Public homepage aggregate counters and featured vacancies;
  jobseeker/employer workflows are login/registration oriented.
- **Machine-readable API?** No verified public API.
- **Download?** No.
- **Authentication required?** Aadhaar/login required for jobseeker workflows.
- **Update frequency:** Live; not a reproducible dataset.
- **Historical data:** Not established.
- **Maharashtra/district filtering:** Maharashtra scope; vacancy examples show district
  names, but no stable machine-readable filter.
- **Relevant fields:** Aggregate counters; not source-record metadata.
- **Licence/reuse:** **PROVENANCE_REQUIRED** — live UI counters are not a stable dataset.
- **Supports PS 26134:** Weak; counters are presentation-only and not reproducible
  evidence for **A–L**.
- **Go/No-Go:** **NO-GO** — **NOT USABLE** as evidence.

---

### 3.6 NSDC (National Skill Development Corporation)

- **Official URLs:**
  - https://www.nsdcindia.org/
  - https://stag-api.nsdcindia.org/state-wise-reports
  - https://stag-api.nsdcindia.org/estimating-skill-stock-maharashtra
- **Organization:** NSDC
- **Data available:** National QP/NOS reference; state-wise report index with
  downloadable PDFs; Maharashtra skill-stock detail page.
- **Machine-readable API?** Report index / public HTML; **no tabular API observed**.
- **Download?** PDF links; no verified CSV/JSON.
- **Authentication required?** Public.
- **Update frequency:** Reports listed/updated with dates (e.g., 07 Aug 2025).
- **Historical data:** Report PDFs; not time-series tables.
- **Maharashtra/district filtering:** State-level (the Maharashtra skill-stock detail page
  currently links to a **Madhya Pradesh** PDF → **IMPORT_BLOCKED_PROVENANCE**).
- **Relevant fields:** Report/PDF content; not structured vacancy/skill tables.
- **Licence/reuse:** **PDF_REFERENCE_ONLY**; the Maharashtra file mismatch prevents safe
  import.
- **Supports PS 26134:** Context for **B/D** (national skill stock and QP/NOS); **not**
  Maharashtra job demand or placement evidence.
- **Go/No-Go:** **NO-GO** as evidence — **REFERENCE ONLY**.

---

### 3.7 National Career Service (NCS)

- **Official URLs:** https://www.ncs.gov.in/, https://www.ncs.gov.in/job-listing,
  https://www.data.gov.in/catalog/national-career-service-ncs, https://dge.gov.in/ncs
- **Organization:** Ministry of Labour & Employment / DGE
- **Data available:** Job portal SPA (login-gated); data.gov.in catalog exists but contains
  **no resources**; DGE documents **G2G** state-integration web services (not public).
- **Machine-readable API?** **No public API** (OGD `/apis` = 0; Catalog API unavailable).
- **Download?** No vacancy dataset.
- **Authentication required?** Registration/login for jobseeker/employer workflows.
- **Supports PS 26134:** Intended for **A (job demand)** but **unusable**.
- **Go/No-Go:** **NO-GO** — full detail in `docs/research/NCS_DATA_ACCESS.md`.

---

### 3.8 Maharashtra Commissionerate of Economics & Statistics (DES)

- **Official URL:** https://mahades.maharashtra.gov.in/
- **Organization:** Government of Maharashtra, Commissionerate of Economics & Statistics
  (Directorate of Economics & Statistics)
- **Data available:**
  - **State & district indicators** dashboard ("दृष्टीक्षात महाराष्ट्रातील जिल्हे" —
    clickable districts; state indicators: population, health, education (UDISE+), labour
    force (PLFS), electricity, banking, multi-dimensional poverty, roads, internet).
  - **Periodic Labour Force Survey (PLFS)** statistics (LFPR, WPR, unemployment rate —
    state-level, e.g., rural/urban for 2023-24).
  - **Economic Survey 2025-26** highlights (English & Marathi PDFs)
    ("महाराष्ट्राची आर्थिक पाहणी २०२५-२६").
  - **Annual Survey of Industries (ASI)** and **state income** dashboards.
  - **State Business Register (SBR)** project.
  - **"Maharashtra Data Repository"** (chapter / value / unit / years — JS-rendered table).
  - **All-Indicators PDF** (e.g., `All_Indicators_Maharashtra_25_26_Mar.pdf`).
- **Machine-readable API?** Dashboards are JS-rendered; **no documented public
  machine-readable API confirmed**.
- **CSV/Excel/JSON download?** **Not verified.** PDFs are confirmed (Econ Survey highlights,
  all-indicators PDF); tabular exports/APIs were not confirmed.
- **Authentication required?** Public.
- **API key required?** No.
- **Update frequency:** Annual (Economic Survey 2025-26; PLFS annual reports; ASI annual);
  some indicators current (e.g., 2024-25 education indicators).
- **Historical data:** **Yes** — annual Economic Survey (published since 1978 in pocket-book
  form), annual PLFS series, annual ASI. Time-series available in PDF/report form.
- **Maharashtra/district filtering:** **Yes** at state level (indicators); **district-level**
  via the district-at-a-glance dashboard (machine-readable export not confirmed).
- **Relevant fields (state-level):** labour force participation rate, worker population
  ratio, unemployment rate, population (projected), education enrolment/dropout (UDISE+),
  health indicators, electricity, banking, roads, internet, state income, ASI industrial
  statistics.
- **Licence/reuse terms:** Official government statistics; **attribution to the source is
  required**. Raw microdata is not public; aggregates/PDFs are published for statistical
  analysis. No explicit automated-retrieval or reuse statement was confirmed.
- **Attribution requirements:** Record source URL + retrieval date + period (FY/year) +
  indicator definition.
- **Automated retrieval permitted?** **Not verified** for a machine-readable feed; PDFs are
  publicly downloadable.
- **Supports PS 26134:** Provides **economic and labour-market context** (demand side
  weakly, only aggregate rates — not job postings), **D (sector demand via ASI)**,
  **E (district context)**. It does **not** provide skills demand, courses, providers,
  placements, or employer requirements.
- **Go/No-Go:** **NO-GO** as job/skill demand evidence; **REFERENCE ONLY** for statistical
  context. It would become **CONDITIONAL-GO** only if a verified machine-readable aggregate
  export (CSV/Excel/JSON/API) is confirmed for state/district indicators.

---

### 3.9 Skill India Digital Hub (SIDH)

- **Official URL:** https://skillindiadigital.gov.in/
- **Organization:** Ministry of Skill Development & Entrepreneurship (MSDE) / Skill India
- **Data available (observed):** SPA homepage; PMKVY 4.0 notices; "Location" filter;
  search and profile icons; course-detail route pattern (`courses/detail/{uuid}`); Ministry
  of Skill Development & Entrepreneurship branding. Courses, training centres, and skills
  are surfaced via the client-side app.
- **Machine-readable API?** **No documented public developer API confirmed.** The site is a
  JS-rendered SPA; the course-detail URL is a client route, not a documented public
  endpoint.
- **CSV/Excel/JSON download?** **Not verified.**
- **Authentication required?** Public browsing appears possible; operational/partner
  workflows (training centre, PMKVY) likely require registration.
- **API key required?** **Not confirmed.**
- **Update frequency:** Live (PMKVY 4.0 notices dated 2025; ongoing notices).
- **Historical data:** **Not verified.**
- **Maharashtra/district filtering:** A "Location" filter exists; **machine-readable
  Maharashtra/district filtering is not verified.**
- **Relevant fields:** Courses, skills, training centres, location — **not verified** as a
  structured record schema.
- **Licence/reuse terms:** **Not documented/verified.**
- **Attribution requirements:** To be defined only once a verified source/API and reuse
  terms are established.
- **Automated retrieval permitted?** **Not established** — do not treat visible browser data
  as an API.
- **Supports PS 26134:** Potential for **F (Courses)**, **G (Providers)**, **B (Skills)**;
  **not yet usable without verified machine-readable access.**
- **Go/No-Go:** **CONDITIONAL-GO only after verification** of a documented machine-readable
  API or export, its Maharashtra filtering, and reuse terms. Until verified,
  **NOT USABLE**.

---

### 3.10 Directorate General of Training (DGT) / NCVT MIS

- **Official URL:** https://dgt.gov.in/
- **Organization:** Directorate General of Training, MSDE
- **Data available (observed):** Public aggregates — **13,888 ITIs**, **2,389,514 ITI
  trainees**, **213,580 apprentices** (under notified trades); CTS (Craftsman Training
  Scheme) / CITS (Craft Instructor Training Scheme) trade information; ITI affiliation
  portal; NIMS (National Instructional Media Institute); PDFs (e.g., CTS rationalisation,
  introduction of new trades).
- **Machine-readable API?** **No public machine-readable API confirmed** on the front page.
  The ITI affiliation / NCVT MIS portals are operational web apps, not documented public
  data APIs.
- **CSV/Excel/JSON download?** **Not verified.** PDFs are confirmed.
- **Authentication required?** Public content; operational portals (affiliation, MIS) are
  institute-facing.
- **API key required?** **Not confirmed.**
- **Update frequency:** Live; annual trade/session notices.
- **Historical data:** Annual session/trade data exists operationally; **not verified** as a
  public time-series export.
- **Maharashtra/district filtering:** ITIs are state-administered; DGT is national.
  **Maharashtra filtering is not verified** via a machine-readable export; the regional
  institutes cover multiple states.
- **Relevant fields (observed):** trade, course (CTS/CITS), ITI, trainee count, apprentice
  count. As public aggregates/PDFs, not a structured record schema.
- **Licence/reuse:** Government; **not documented** for automated retrieval. Reference only
  in current form.
- **Attribution requirements:** Record source URL + retrieval date.
- **Automated retrieval permitted?** **Not established.**
- **Supports PS 26134:** Potential for **F (Courses)**, **C (Job roles via trades)**,
  **G (Training providers via ITIs)**, **H (Training capacity via trainee/apprentice
  counts)**; **not yet usable** without a verified machine-readable export.
- **Go/No-Go:** **NO-GO** as structured demand evidence (aggregates/PDFs are
  **REFERENCE ONLY**). Would become **CONDITIONAL-GO** only if a verified machine-readable
  export (e.g., ITI/trade/seat data with state filter) is confirmed.

---

## 4. Coverage matrix (evidence A–L × sources)

| Source | A | B | C | D | E | F | G | H | I | J | K | L |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Planning Dept 36 Districts | — | — | — | — | ✓ (master) | — | ✓ (map) | ✓ (map) | — | — | — | — |
| MSSDS Course Master | — | — | — | ~ | — | ✓ | — | — | — | — | — | — |
| MSSDS Training Centre directory | — | — | — | ~ | ✓ | ✓ | ✓ | ~ | — | — | — | — |
| MSSDS Skill Gap / Booklets | — | — | — | ~ | ~ | — | — | — | — | — | — | — |
| Rojgar Mahaswayam | ~ | — | — | — | — | — | — | — | — | — | — | — |
| NSDC | — | ~ | — | ~ | — | — | — | — | — | — | — | — |
| NCS | ✗ | — | — | — | — | — | — | — | — | — | — | — |
| Maharashtra DES | ~ | — | — | ✓ | ✓ | — | — | — | — | — | — | — |
| SIDH | — | ~ | — | — | — | ~ | ~ | — | — | — | — | ~ |
| DGT / NCVT MIS | — | — | ~ | — | — | ~ | ~ | ~ | — | — | — | — |

Legend: ✓ = supported (verified); ~ = partial/possible but requires verification or is
aggregate/context only; ✗ = unusable; — = not provided.

---

## 5. Recommended sources

1. **MSSDS Course Master (official Excel export)** — highest-value, official Maharashtra
   source for **F (Courses)**; pursue the visible official export with full provenance, and
   resolve the schema gap + the contradictory-export blocker before import.
   - Status: **CONDITIONAL-GO**.
2. **MSSDS Training Centre directory (structured export)** — official Maharashtra source
   for **G (Training providers)** and **H (Training capacity)** at district level; requires
   a verified structured export and a privacy review of contact fields.
   - Status: **CONDITIONAL-GO**.
3. **Maharashtra DES (DES) statistical aggregates** — use as **reference/context** for
   labour-market and district economic context (**D, E**); upgrade to **CONDITIONAL-GO**
   only if a machine-readable aggregate export is verified.
   - Status: **REFERENCE ONLY** (context).
4. **Planning Dept 36 Districts** — already imported; the canonical district master.
   - Status: **GO** (geography master only).

No source is currently classified **DIRECTLY USABLE for job/skills demand evidence** (A/B)
or **placements** (I). Those remain **NOT_YET_AVAILABLE**, consistent with the existing
Phase 6 gap analysis.

---

## 6. Blocked sources

- **NCS** — NO-GO (documented in `docs/research/NCS_DATA_ACCESS.md`).
- **Rojgar Mahaswayam** — NO-GO (live counters, no provenance, login-gated).
- **NSDC Maharashtra skill-stock detail** — **IMPORT_BLOCKED_PROVENANCE** (page links to a
  Madhya Pradesh PDF).
- **MSSDS Course Master** — **BLOCKED_SCHEMA_GAP** and **IMPORT_BLOCKED_PROVENANCE** until
  the schema and the contradictory-export issue are resolved.
- **MSSDS Training Centre directory** — blocked on provenance + privacy review + a verified
  structured export.
- **SIDH** — blocked on verification of a machine-readable API/export, Maharashtra
  filtering, and reuse terms.
- **DGT / NCVT MIS** — blocked on verification of a machine-readable, Maharashtra-filterable
  export (public site currently provides aggregates/PDFs only).
- **Maharashtra DES** — blocked on verification of machine-readable export/API for
  state/district indicators (PDFs are reference-only).

---

## 7. Final recommended data architecture (research only)

SkillMitra's Phase 6 pipeline (`approved source → ingestion run → raw record →
validation → canonical mapping → demand signal`) requires **approved structured records**
with provenance. The recommended architecture, consistent with that design, is:

1. **No scraping, no crawl, no arbitrary URL fetch.** Only sources with a documented API
   or a captured structured file (CSV/Excel/JSON) are admissible.
2. **Do not treat any webpage as an API.** SIDH, DGT, DES dashboards, Rojgar counters, and
   MSSDS HTML directories are not APIs until a machine-readable export/API is verified.
3. **Preserve provenance on every record:** source organization, official URL, retrieval
   date, source record ID, file/API version, ingestion run, and transformation/mapping
   rules. If a field (district, role, skill, proficiency, source record ID) is absent,
   classify the result as `INSUFFICIENT_EVIDENCE` rather than deriving a number.
4. **Populate evidence only where an approved structured source exists:**
   - **F (Courses):** via an officially captured MSSDS Course Master export (after schema +
     provenance resolution).
   - **G (Providers) / H (Capacity):** via a verified MSSDS Training Centre structured
     export (after provenance + privacy review).
   - **D/E (Sector/District context):** via verified Maharashtra DES aggregate exports
     (context only) or the already-imported geography master.
5. **Keep demand signals (A/B) and placements (I) as `NOT_YET_AVAILABLE`** until an
   approved structured source with job/skill records and a verified Maharashtra filter is
   established (none was found).
6. **Do not input survey/consultation data as demand evidence** unless it carries
   normalized skill/proficiency payloads (existing Phase 6 rule).
7. **Emerging skills (L)** remain `NOT_YET_AVAILABLE` because no approved technology-trend
   source was verified (SIDH is the nearest candidate but is unverified).

---

## 8. Per-source decision summary

| Source | Classification | Go / No-Go |
|---|---|---|
| Planning Dept 36 Districts | DIRECTLY USABLE (geography master) | **GO** |
| MSSDS Course Master | USABLE WITH REGISTRATION/EXPORT | **CONDITIONAL-GO** (after export + schema + provenance) |
| MSSDS Training Centre directory | USABLE WITH REGISTRATION/APPROVAL | **CONDITIONAL-GO** (after export + provenance + privacy) |
| MSSDS Skill Gap Study / Booklets | REFERENCE ONLY | **NO-GO** (reference) |
| Rojgar Mahaswayam | NOT USABLE | **NO-GO** |
| NSDC | REFERENCE ONLY | **NO-GO** (reference; MH detail blocked) |
| NCS | NOT USABLE | **NO-GO** |
| Maharashtra DES | REFERENCE ONLY | **NO-GO** as demand evidence (**CONDITIONAL-GO** only if machine-readable aggregate verified) |
| Skill India Digital Hub | NOT USABLE (unverified) | **CONDITIONAL-GO** only after verification (API/export + MH filter + reuse terms) |
| DGT / NCVT MIS | REFERENCE ONLY | **NO-GO** as structured demand (**CONDITIONAL-GO** only if machine-readable export verified) |

---

## Appendix A — What was verified vs. what remains blocked

### Verified
- Planning Dept 36 districts: canonical state (`MH`)/district names; no district codes;
  already imported via idempotent seed; source URL recorded.
- MSSDS Course Master page exposes an official **Export to excel** control and a structured
  table (fields listed in §3.2); actual export request/file/permission statement not
  captured.
- MSSDS Training Centre directory is public and paginated (~249 pages) with
  scheme/sector/district/city/VTP/contact/courses fields; no stable export/API verified.
- MSSDS Skill Gap Study (FY 2023-24) and District Information Booklets are PDFs.
- Rojgar Mahaswayam homepage exposes live aggregate counters and login-gated workflows.
- NSDC state-wise reports are PDF links; the Maharashtra skill-stock detail page currently
  links to a Madhya Pradesh PDF (`IMPORT_BLOCKED_PROVENANCE`).
- NCS portal is a login-gated SPA; data.gov.in NCS catalog is empty (no resources, Catalog
  API unavailable); DGE documents G2G state-integration web services only (see
  `NCS_DATA_ACCESS.md`).
- Maharashtra DES provides state & district indicators, PLFS labour-force statistics
  (state-level), Economic Survey 2025-26 highlights PDFs (English/Marathi), ASI, state
  income dashboard, State Business Register, a "Maharashtra Data Repository" table, and an
  All-Indicators PDF. District-at-a-glance is clickable. No confirmed machine-readable
  export/API.
- SIDH is a JS-rendered SPA (course-detail UUID route, PMKVY 4.0 notices, "Location"
  filter); no documented public developer API.
- DGT public site shows aggregate counters (13,888 ITIs; 2,389,514 ITI trainees; 213,580
  apprentices), CTS/CITS information, an ITI affiliation portal, and PDFs; no verified
  public machine-readable data API on the front page.

### Blocked / not established
- MSSDS Course Master official export file, request metadata, and permission statement.
- MSSDS Training Centre structured export/API and privacy approval for contact fields.
- Any machine-readable API/export for Maharashtra DES state/district indicators.
- Any machine-readable, Maharashtra-filterable API/export from SIDH.
- Any machine-readable, Maharashtra-filterable ITI/trade/seat export from DGT/NCVT MIS.
- Any official machine-readable **job vacancy** dataset (NCS) for Maharashtra.
- Any official machine-readable **skills demand**, **placement outcome**, or
  **employer requirements** dataset for Maharashtra.
- Explicit reuse/redistribution/attribution terms for automated retrieval from SIDH, DGT,
  DES, and MSSDS (beyond the visible public pages/PDFs).
