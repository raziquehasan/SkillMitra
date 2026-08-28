# NCS Data Access — Maharashtra Job-Posting Research

Research date: 2026-08-28
Scope: Determine the officially permitted and technically usable way to obtain
National Career Service (NCS) job-posting data for Maharashtra for SkillMitra's
labour-market intelligence system.

> Summary outcome: **NO-GO.** No officially documented public NCS API exists, the
> data.gov.in NCS catalog contains **no resources**, and reuse permissions cannot be
> established. Do not implement ingestion; do not modify Phase 5 services, the
> schema, migrations, or dependencies.

---

## 1. Official sources checked

| Source | URL | Result |
|---|---|---|
| NCS home | https://www.ncs.gov.in/ | Job portal SPA. Jobseeker/employer registration & login; no public API documented in navigation or content. |
| NCS job search (task-supplied) | https://www.ncs.gov.in/job-seeker/Pages/Search.aspx | Legacy/derived path. The live search is served at `/job-listing`; returns the app shell (client-rendered), not a dataset. |
| NCS job listing | https://www.ncs.gov.in/job-listing | Client-rendered SPA shell; job results are fetched by the frontend app, not exposed as a documented public API. |
| data.gov.in NCS catalog | https://www.data.gov.in/catalog/national-career-service-ncs | Catalog metadata only. Shows **"No Result Found..."** (no resource files). **"Catalog API not available"**. Published 12/07/2022, Updated 18/02/2025. License: NDSAP. Contributor: Ministry of Labour and Employment. |
| data.gov.in API listing | https://www.data.gov.in/apis | **"0 - 0 of 0 API(s)"** and **"No Result Found..."**; portal notes it is under maintenance. |
| data.gov.in search (title=NCS) | https://www.data.gov.in/search?title=NCS | **"No Result Found..."**; portal notes maintenance. No NCS resources returned. |
| DGE — NCS | https://dge.gov.in/ncs | Ministry/DGE page. Documents **G2G web services** for inter-linking state employment-exchange databases with the NCS Portal; integration with e-Shram, EPFO, ESIC, etc. No public third-party vacancy API. Confirms **NCO-2015** classification (52 sectors, 3600+ job roles). |
| NCS Meta Data (official doc) | ncsdocsstorage … newsletter_1786966203159.pdf | **Scanned image PDF** — no extractable text; not machine-readable. |
| NCS mobile app | Google Play `com.gov.ncs` | Consumer app; no documented developer API for vacancy retrieval. |

---

## 2. API availability

- **No officially documented public NCS API for job vacancies.** The NCS portal is a
  single-page application; job search is client-rendered and requires the
  jobseeker/employer registration and login flow. No public developer/API
  documentation, endpoint reference, or console is published.
- The **data.gov.in** NCS catalog explicitly reports **"Catalog API not available"**,
  and the OGD platform-wide `/apis` listing reports **0 APIs**.
- The DGE page states that web services have been created for
  **inter-linking state databases with the NCS Portal** ("For States having ICT based
  integrated systems for the employment exchanges"). This is a
  **government-to-government (G2G) integration** for state employment-exchange
  systems — **not** a public API for third-party retrieval of job vacancies.
- Conclusion: **No public API** exists that SkillMitra can use.

---

## 3. Download availability

- **No downloadable NCS job-vacancy dataset found.**
- The data.gov.in NCS catalog contains **no resource files** (it shows "No Result
  Found") — the "Zip Download" control would produce nothing. The NDSAP
  license applies to data that is actually published, but none is attached to this
  catalog.
- NCS publishes **scanned PDFs** (e.g., NCS Meta Data, newsletters, EEx Statistics)
  and report/statistics pages, not machine-readable vacancy datasets. The NCS Meta
  Data resource is an image-only PDF.

---

## 4. Authentication requirements

- **Public NCS vacancy API:** none exists, so no credentials are applicable.
- **data.gov.in OGD API:** the OGD platform generally requires an **API key**
  (registered via `api.data.gov.in`) to call hosted datasets — but the NCS catalog
  exposes **no API and no datasets**, so this is moot for NCS job data.
- **NCS portal:** jobseeker and employer workflows (search, post jobs, apply)
  require **registration/login**. There is no anonymous, documented, machine-readable
  way to enumerate vacancies.
- **Catalog subscription:** data.gov.in shows a "Please Login to Subscribe" control
  on the catalog page, but this subscribes to catalog updates for a catalog that has
  no resources (and the page currently shows the API as unavailable).

---

## 5. Available fields

- **No published machine-readable field schema** for NCS job vacancies was found.
- NCS uses the **National Classification of Occupations 2015 (NCO-2015)** as its
  occupational taxonomy, presenting career information across **52 sectors** and
  **3600+ job roles**. NCO codes exist, but the DGE content describes *career
  information* (video/text guidance), not a documented vacancy record schema.
- SkillMitra's target normalized fields —
  `source, source_record_id, job_title, employer_name, state, district, sector,
  functional_area, functional_role, required_skills, experience_required,
  education_required, salary_min, salary_max, job_nature, posted_date, source_url,
  fetched_at` — **cannot be mapped to any official, documented NCS data structure.**
  This is a blocking gap for ingestion.

---

## 6. Maharashtra filtering capability

- **No documented API or dataset supports state/district filtering** of NCS job
  vacancies.
- The NCS portal search is client-side UI functionality; there is no documented,
  stable state/district filter that yields a reproducible, machine-readable
  Maharashtra subset.
- Because no official structured source exists, **Maharashtra-scoped records cannot
  be reliably obtained**, and therefore cannot be reliably mapped to the canonical
  `SkillMitra.districts` table (state `MH`, 36 official districts). Per the task
  constraints, we **do not invent district mappings**.

---

## 7. Historical data availability

- **No documented historical job-posting dataset** was found.
- NCS provides EEx (Employment Exchange) statistics, annual reports, and newsletter
  PDFs (many scanned) — these are reference/report material, not historical vacancy
  records with stable source IDs.
- The data.gov.in NCS catalog was last updated 18/02/2025 but contains **no
  resources**, so there is no historical file to harvest.

---

## 8. Update frequency

- **Not documented** for any vacancy dataset.
- The NCS portal is a live system; there is no published update cadence for vacancy
  data. The OGD catalog "Updated On" (18/02/2025) refers to catalog metadata, not
  to data refreshes (and there are no resources).

---

## 9. Attribution / licensing / reuse notes

- **data.gov.in:** datasets are released under the **National Data Sharing and
  Accessibility Policy (NDSAP)**. However, the NCS catalog has **no datasets**, so
  NDSAP does not currently grant access to NCS job data.
- **NCS portal:** public statements state that *"NCS services are free of cost"* and
  include an **anti-fraud notice** that warns about websites/employers claiming
  association with NCS/MoLE or using the NCS logo. This is directly relevant to
  attribution: SkillMitra must **not** misrepresent any retrieved content as official
  NCS data, and must not present scraped content under the NCS name.
- **No explicit reuse/redistribution terms** for automated retrieval of NCS vacancy
  data were found. There is no API terms-of-use, licence, or permission statement for
  a third-party integration.
- If any future official source is obtained, SkillMitra's existing provenance
  requirements (organization, source URL, retrieval date, source record ID, file/API
  version, permitted transformation) must be preserved in `data_sources` and
  ingestion runs.

---

## 10. Recommended ingestion method

- **None at this time.**
- Do **not** implement ingestion from NCS. The task's rules are upheld:
  - Do not scrape the NCS website.
  - Do not implement a crawler.
  - Do not create fake/sample job data.
  - Do not modify the database schema.
  - Do not add API endpoints.
  - Do not modify Phase 5 services.
  - Do not create migrations.
  - Do not add dependencies.
- If a future, officially documented public API or a real data.gov.in NCS dataset is
  published, re-run this research and obtain: documentation URL, authentication
  method, field schema, update cadence, licence/reuse terms, and a Maharashtra
  filtering mechanism before any ingestion design.

---

## 11. What is NOT officially supported

- **No public NCS job-vacancy API.**
- **No data.gov.in NCS dataset/resources** (catalog exists but is empty; Catalog API
  not available; OGD `/apis` = 0).
- **No machine-readable field schema** to map to SkillMitra's target fields.
- **No state/district (Maharashtra) filter** on any official machine-readable source.
- **No historical job-posting dataset.**
- **No documented update frequency.**
- **No documented partner-vs-direct NCS job distinction.** The NCS portal surfaces
  aggregator/partner employers (e.g., "Top Hiring Companies of 2026" — Apna, Swiggy,
  Cassius Technologies, T.M. Inputs, Quess) and a separate "e-migrate" channel for
  international jobs, but there is **no documented field** that distinguishes
  partner-posted jobs from direct NCS-posted jobs in any retrievable record.
- **No sanctioned automated retrieval.** The only practical method would be
  undocumented scraping of a client-rendered, login-gated SPA, which conflicts with
  the platform's anti-fraud/affiliation positioning and has no established reuse
  terms.

---

## 12. Go / No-Go decision

### **NO-GO**

**Rationale:** A GO requires an officially documented API or a government dataset
providing sufficient job data with appropriate reuse. A CONDITIONAL GO would apply
if official data existed but required registration, approval, or credentials.
Neither condition is met:

1. **No officially documented public NCS API** exists (OGD `/apis` = 0; NCS catalog
   "Catalog API not available"; DGE's web services are G2G state integrations only).
2. **No government dataset** with job/vacancy records exists (data.gov.in NCS catalog
   is empty — "No Result Found").
3. **No field schema**, **no Maharashtra filtering**, **no historical data**, and
   **no documented update cadence**.
4. **Reuse permissions cannot be established** — the only practical path is
   undocumented scraping of a login-gated SPA, which is explicitly out of scope and
   unsupported.

Per the decision rules and task constraints, **SkillMitra will not implement NCS
ingestion** and will not modify existing Phase 5 services, the database schema, or
add endpoints/dependencies. The only artifact produced from this research is this
document.

---

## Appendix A — What was verified vs. what remains blocked

### Verified
- The NCS portal is a client-rendered SPA job portal requiring registration/login;
  `/job-listing` returns the app shell; no public API is documented.
- The data.gov.in NCS catalog page exists but contains **no resources** ("No Result
  Found"), and its Catalog API is marked **not available**.
- The OGD platform `/apis` listing returns **0 of 0 APIs**; the platform pages note
  they are under maintenance.
- The DGE page documents G2G web services for state employment-exchange integration
  (not a public third-party API) and confirms NCS uses **NCO-2015** (52 sectors,
  3600+ job roles).
- The NCS "Meta Data" document is a **scanned image PDF** (not machine-readable).
- NCS publishes an anti-fraud notice and states services are free; no reuse terms for
  automated retrieval were found.
- NCS surfaces aggregator/partner employers and a separate e-migrate channel, but no
  documented field distinguishes partner vs. direct NCS jobs.

### Blocked / not established
- Any official public NCS vacancy API endpoint and its credentials/keys.
- Any downloadable NCS job-vacancy dataset.
- A machine-readable field schema and a mapping to SkillMitra's target normalized
  fields.
- A state/district (Maharashtra) filtering capability on any official source.
- Historical job-posting data availability.
- A documented update frequency.
- Explicit reuse/redistribution/attribution terms for automated retrieval.
- A partner-vs-direct NCS job distinction field.
