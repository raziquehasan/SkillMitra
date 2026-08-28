# Phase 6.6 — Blocker Resolution: Maharashtra Real Skills Dataset

Status: **READ-ONLY INVESTIGATION**. No import, no schema change, no migration.
Author: SkillMitra Phase 6.6. Date: 2026-08-28.
Prerequisites: Phase 6.5 validation complete, Phase 6.4 schema gap resolution applied.

---

## BLOCKER RESOLUTION SUMMARY

| Blocker | Status | Resolution |
|---|---|---|
| 1. Course version | INSUFFICIENT_EVIDENCE | No version field in dataset |
| 2. District mapping | REVIEW_REQUIRED | 3 unmatched; 1 review proposal |
| 3. Provider identity | INSUFFICIENT_EVIDENCE | No user linkage mechanism |
| 4. Skill mapping | REVIEW_REQUIRED | 1 exact, 6 ambiguous, 28 unmatched |
| 5. Job role mapping | REVIEW_REQUIRED | 4 exact, 7 unmatched |
| 6. Market demand | BLOCKED | No provenance metadata |
| 7. Employers | BLOCKED | No verification evidence |
| 8. Placement data | RESOLVED (NO ACTION) | Aggregate stats only, no individual records |
| 9. Provenance | PARTIAL | SHA-256 verified; all other provenance missing |

---

## 1. COURSE VERSION — INSUFFICIENT_EVIDENCE

### Finding
The dataset `maharashtra_real_skills_data.csv` contains **19 columns**. None of them is a version field.

**Columns inspected:**
- `Course_ID` — format `MH-CRS-1001` through `MH-CRS-1050`. Sequential numeric suffix. Not a version.
- `Course_Name` — descriptive title. Not a version.
- `Curriculum_Last_Update` — 19 unique dates (2023-01-15 through 2024-12-15). These are **curriculum update timestamps**, not dataset/source versions.
- No other column contains version-like information (no "version", "ver", "rev", "batch", "year", "fy", "fiscal" in any header).

### Current constraint (Phase 6.4 migration `9a0b1c2d3e4f`)
```
uq_courses_source_identity: UNIQUE (data_source_id, source_course_code, source_version)
```

### Decision
**COURSE_VERSION_STATUS = INSUFFICIENT_EVIDENCE**

Cannot import courses without `source_version`. The constraint requires it.

### What would resolve this blocker
1. An official export metadata document from the source organization indicating the dataset version/release.
2. A `source_version` column added to the dataset file by the data provider.
3. A documented convention that maps the dataset to a specific version (e.g., "2024-Q1 export").
4. A schema change to make `source_version` nullable in the unique constraint (requires explicit approval and migration).

### Do NOT
- Invent a version (e.g., "v1", "2024", file hash, row count).
- Use `Curriculum_Last_Update` as a proxy version.
- Modify the constraint to bypass version requirement without documented approval.

---

## 2. DISTRICT MAPPING — REVIEW_REQUIRED

### Current unmatched values
| Source Value | Status | Evidence Required |
|---|---|---|
| Aurangabad | REVIEW_REQUIRED | Confirmation that Aurangabad district = Chhatrapati Sambhajinagar |
| Mumbai | INSUFFICIENT_EVIDENCE | Ambiguous: Mumbai City vs Mumbai Suburban |
| Navi Mumbai | INSUFFICIENT_EVIDENCE | Not present in canonical districts table |

### Matched districts (exact)
| Source Value | Canonical District |
|---|---|
| Amravati | Amravati |
| Kolhapur | Kolhapur |
| Nagpur | Nagpur |
| Nashik | Nashik |
| Pune | Pune |
| Solapur | Solapur |
| Thane | Thane |

### Mapping proposals

#### 2.1 Aurangabad → Chhatrapati Sambhajinagar
- **Status:** REVIEW_REQUIRED
- **Proposal:** Map `Aurangabad` (source) to `Chhatrapati Sambhajinagar` (canonical)
- **Reason:** The Government of Maharashtra officially renamed Aurangabad district to Chhatrapati Sambhajinagar. The canonical `districts` table contains `Chhatrapati Sambhajinagar`.
- **Evidence required:** Official government order or notification confirming the rename.
- **Risk:** Without official confirmation, this is a name-based assumption, not a verified identity.

#### 2.2 Mumbai → Mumbai City or Mumbai Suburban
- **Status:** INSUFFICIENT_EVIDENCE
- **Proposal:** None — cannot disambiguate
- **Reason:** The canonical table has TWO districts: `Mumbai City` and `Mumbai Suburban`. The source value `Mumbai` does not specify which. Mumbai is also commonly used as a metropolitan area reference that spans both districts.
- **Evidence required:** Clarification from the source data provider about which district each `Mumbai` entry refers to.

#### 2.3 Navi Mumbai → NOT IN CANONICAL TABLE
- **Status:** INSUFFICIENT_EVIDENCE
- **Proposal:** None — cannot map
- **Reason:** `Navi Mumbai` is a planned city/township that spans parts of Thane, Raigad, and Mumbai Suburban districts. It is NOT a standalone district in the canonical `districts` table. The source uses it as a district-level value, but no canonical district matches it exactly.
- **Evidence required:** Either (a) the source provider clarifies which canonical district Navi Mumbai entries belong to, or (b) the canonical districts table is expanded with official approval.

### Do NOT
- Auto-map Mumbai to Mumbai City or Mumbai Suburban.
- Create a new "Navi Mumbai" district record.
- Apply the Aurangabad → Chhatrapati Sambhajinagar mapping without documented approval.

---

## 3. PROVIDER IDENTITY — INSUFFICIENT_EVIDENCE

### Current schema
```
training_providers.user_id: NOT NULL, UNIQUE, FK → users.id ON DELETE CASCADE
```

### Current state
- **Users in DB:** 96
- **Providers in DB:** 0
- **Providers with linked users:** 0
- **External providers in dataset:** 38 unique provider names

### Analysis
The `training_providers` table requires every provider to have a linked `user` account. This is a 1:1 relationship enforced by NOT NULL + UNIQUE on `user_id`.

External providers from the dataset (e.g., "Skill India Center - Mumbai", "GreenEarth Training Solutions - Pune") are **not** SkillMitra platform users. There is no mechanism to:
1. Create a user account for an external provider without their consent/registration.
2. Link a provider to an existing user that represents that external entity.
3. Store a provider without a user linkage.

### Possible outcomes assessed

**A. Existing legitimate user linkage exists**
- **Assessment:** NO. Zero providers exist. Zero users are linked to providers. No mechanism for external provider user creation has been documented.

**B. Provider identity can be represented without user linkage**
- **Assessment:** NO. The schema enforces `user_id NOT NULL`. Cannot insert a provider row without a user.

**C. Schema change is genuinely required**
- **Assessment:** YES, but this is a **Phase 7+ decision**, not a Phase 6.6 action.
- The `user_id` requirement appears to model SkillMitra-registered providers. External/imported providers from government datasets may legitimately need a different identity mechanism (e.g., `source_provider_id` + `data_source_id` as identity, or making `user_id` nullable with a separate verification flow).
- **Do NOT implement this in Phase 6.6.** Document it as a future decision.

**D. Evidence insufficient**
- **Assessment:** This is the current status. Cannot determine the correct provider identity model without explicit product decision.

### Decision
**PROVIDER_IDENTITY_STATUS = INSUFFICIENT_EVIDENCE**

### What would resolve this blocker
1. Product decision on whether external providers can be represented without user accounts.
2. If yes: schema change to make `user_id` nullable or add an alternate identity mechanism.
3. If no: a user registration/onboarding flow for external providers.
4. Either path is a Phase 7+ decision, not Phase 6.6.

### Do NOT
- Create fake SkillMitra users to satisfy the FK.
- Modify the schema in this phase.
- Import providers into a non-canonical staging table without explicit approval.

---

## 4. SKILL MAPPING — REVIEW_REQUIRED

### Dataset skills (35 unique values)
| Source Value | Status | Candidate Canonical Skill | Notes |
|---|---|---|---|
| Battery Mgmt Systems | UNMATCHED | — | No equivalent in master |
| Basic Data Management | UNMATCHED | — | No equivalent in master |
| Basic SQL | UNMATCHED | — | No equivalent in master |
| Blood Collection | UNMATCHED | — | No equivalent in master |
| Blueprint Reading | UNMATCHED | — | No equivalent in master |
| CNC Programming | UNMATCHED | — | No equivalent in master |
| Compressor Repair | UNMATCHED | — | No equivalent in master |
| Customer Service | UNMATCHED | — | No equivalent in master |
| Electrical Basics | UNMATCHED | — | No equivalent in master |
| First Aid | UNMATCHED | — | No equivalent in master |
| Gas Charging | UNMATCHED | — | No equivalent in master |
| Hygiene | UNMATCHED | — | No equivalent in master |
| Infection Control | UNMATCHED | — | No equivalent in master |
| Inventory Basics | UNMATCHED | — | No equivalent in master |
| Inverter Wiring | UNMATCHED | — | No equivalent in master |
| Java | UNMATCHED | — | No equivalent in master |
| Load Calculation | UNMATCHED | — | No equivalent in master |
| MS Office | UNMATCHED | — | No equivalent in master |
| OS Installation | UNMATCHED | — | No equivalent in master |
| Panel Mounting | UNMATCHED | — | No equivalent in master |
| Patient Care | UNMATCHED | — | No equivalent in master |
| Precision Machining | UNMATCHED | — | No equivalent in master |
| Safety Standards | UNMATCHED | — | No equivalent in master |
| Sample Handling | UNMATCHED | — | No equivalent in master |
| Tool Setting | UNMATCHED | — | No equivalent in master |
| Typing | UNMATCHED | — | No equivalent in master |
| Vitals Monitoring | UNMATCHED | — | No equivalent in master |
| Git | AMBIGUOUS | Digital Tools | Git is a specific tool; "Digital Tools" is broader. Not auto-mapped. |
| Hardware Troubleshooting | AMBIGUOUS | Hardware | "Hardware Troubleshooting" is a specific skill; "Hardware" is broader. Not auto-mapped. |
| MIG Welding | AMBIGUOUS | Welding | MIG is a specific welding process; "Welding" is general. Not auto-mapped. |
| Motor Diagnostics | AMBIGUOUS | Diagnostics | Similar but not identical scope. Not auto-mapped. |
| Python | AMBIGUOUS | Python Programming | "Python" vs "Python Programming" — close but not exact. Not auto-mapped. |
| Safety | AMBIGUOUS | Industrial Safety | "Safety" is general; "Industrial Safety" is specific. Not auto-mapped. |
| Networking | MATCHED | Networking | Exact match. |

### Decision
**SKILL_MAPPING_STATUS = REVIEW_REQUIRED**

- 1 exact match: `Networking`
- 6 ambiguous: partial overlaps with existing skills, but not exact matches
- 28 unmatched: no existing canonical equivalent

### Do NOT
- Create new skill records for unmatched values.
- Auto-resolve ambiguous matches.
- Modify the skills master.

### What would resolve this
1. Domain expert review of each unmatched skill to map to existing or new canonical skills.
2. Decision on whether to broaden existing skill definitions to absorb close matches.

---

## 5. JOB ROLE MAPPING — REVIEW_REQUIRED

### Dataset roles (11 unique values)
| Source Value | Status | Candidate Canonical Role | Notes |
|---|---|---|---|
| AC/Fridge Repair Tech | UNMATCHED | — | Close to "Home Appliance Technician" but not exact |
| CNC Operator | MATCHED | CNC Operator | Exact match |
| Data Entry Operator | MATCHED | Data Entry Operator | Exact match |
| EV Mechanic | UNMATCHED | — | Close to "EV Service Technician" but not exact |
| IT Support Executive | UNMATCHED | — | Close to "IT Support Technician" but not exact |
| Nursing Assistant | UNMATCHED | — | Close to "Healthcare Worker" but not exact |
| Phlebotomist | UNMATCHED | — | No equivalent in master |
| Software Developer | MATCHED | Software Developer | Exact match |
| Solar Installer | UNMATCHED | — | Close to "Solar PV Installer" but not exact |
| Store Sales Executive | UNMATCHED | — | Close to "Front Office Executive" but not exact |
| Welder | MATCHED | Welder | Exact match |

### Decision
**JOB_ROLE_MAPPING_STATUS = REVIEW_REQUIRED**

- 4 exact matches: `CNC Operator`, `Data Entry Operator`, `Software Developer`, `Welder`
- 7 unmatched: no exact canonical equivalent

### Do NOT
- Create new job role records.
- Auto-resolve near-matches.

### What would resolve this
1. Domain expert review of each unmatched role.
2. Decision on whether to create new canonical roles or map to existing ones.

---

## 6. MARKET DEMAND — BLOCKED

### Dataset values
- `Market_Demand_Vacancies`: present in all 50 rows
- Range: 100 to 976
- Sum: 15,586

### Missing provenance
| Required Field | Present? |
|---|---|
| Source organization | NO |
| Source URL | NO |
| Observation date/period | NO |
| Geography | NO (district not linked to vacancy data) |
| Methodology | NO |
| Observed vs estimated distinction | NO |

### Decision
**DEMAND_STATUS = BLOCKED**

These values cannot be imported into `industry_demand` or `demand_signals` without:
1. Provenance metadata (source, date, period, methodology).
2. District-level geography linkage.
3. Distinction between observed vacancies and estimates.

### Safest future representation
- **Staging/reference dataset:** Store raw values in a dedicated staging table if/when schema is extended.
- **Analytical reference:** Use for planning/trend analysis only, never as official demand signals.

### Do NOT
- Import into `industry_demand` or `demand_signals`.
- Treat values as official government/NCS/MSSDS demand.

---

## 7. EMPLOYERS — BLOCKED

### Dataset values
- `Employer_Industry`: 11 unique values (IT-ITES, Manufacturing, Healthcare, Retail, Automotive, Electronics, Green Jobs)
- `Top_Hiring_Companies`: free-text lists (e.g., "Tata Power Solar, Suzlon, CleanMax")

### Missing evidence
| Required Field | Present? |
|---|---|
| Employer identity (legal entity) | NO |
| Hiring relationship proof | NO |
| Source of hiring information | NO |
| Observation period | NO |
| Verification status | NO |

### Decision
**EMPLOYER_STATUS = BLOCKED**

These are descriptive/reference values only. No evidence proves:
- That the listed companies are official hiring partners.
- That the industry classifications are verified.
- That the data represents actual hiring relationships.

### Do NOT
- Create employer records.
- Create verified hiring partnerships.
- Import into `employers` or `employer_surveys`.

---

## 8. PLACEMENT DATA — RESOLVED (NO ACTION)

### Dataset values
- `Students_Enrolled`: aggregate per course offering
- `Students_Completed`: aggregate per course offering
- `Students_Placed`: aggregate per course offering

### Decision
**PLACEMENT_STATUS = RESOLVED (NO ACTION)**

These are **aggregate statistics**. They do not represent individual:
- Candidates
- Applications
- Placements
- Employers

### Reporting metrics (calculated, not persisted)
| Metric | Formula | Notes |
|---|---|---|
| completion_rate | Students_Completed / Students_Enrolled | Handle zero denominator |
| placement_rate | Students_Placed / Students_Completed | Handle zero denominator |

### Do NOT
- Create individual candidate records.
- Create application records.
- Create placement records.
- Create employer records.

---

## 9. PROVENANCE — PARTIAL

### Verified
| Field | Value | Status |
|---|---|---|
| Source filename | maharashtra_real_skills_data.csv | VERIFIED |
| SHA-256 | 5eb76b465dc1325b8ad21d2dae7d8083e3647b420af950158b88a0c8f7932f36 | VERIFIED (independent recalculation matches Phase 6.5) |

### NOT verified / missing
| Field | Status |
|---|---|
| Official source URL | NOT PROVIDED |
| Government/MSSDS ownership | NOT PROVEN |
| License | NOT PROVIDED |
| Methodology | NOT PROVIDED |
| Dataset version | NOT PROVIDED |
| Retrieval date | NOT PROVIDED |

### Decision
**PROVENANCE_STATUS = PARTIAL**

File existence and content are verified. All provenance metadata that would establish official source, ownership, and methodology is absent.

### Do NOT
- Claim Government of Maharashtra or MSSDS ownership without evidence.
- Invent a source URL, license, or methodology.
- Treat the dataset as an official government export.

---

## 10. RESOLUTION PLAN

### What can safely be imported later (when blockers resolved)

| Data | Prerequisites |
|---|---|
| Courses | source_version + district mapping + provider identity + data source record |
| Providers | user linkage mechanism or schema change |
| Course offerings | courses + providers resolved |
| Skills | domain expert review of unmatched skills |
| Job roles | domain expert review of unmatched roles |
| Demand signals | provenance metadata + district linkage + source confirmation |
| Employers | verification evidence + legitimate identity |

### What must remain blocked

| Data | Reason |
|---|---|
| Courses | No source_version; Phase 6.4 constraint requires it |
| Providers | No user linkage; schema enforces user_id NOT NULL |
| Demand signals | No provenance; no source/date/methodology |
| Employers | No verification evidence |
| Navi Mumbai district entries | No canonical district mapping |
| Mumbai entries | Ambiguous (City vs Suburban) |

### Recommended schema changes (Phase 7+, not Phase 6.6)

1. **Provider identity:** Revisit `training_providers.user_id` requirement. Consider:
   - Making `user_id` nullable for externally-sourced providers.
   - Adding a `source_provider_id` + `data_source_id` composite identity for imported providers.
   - Adding a provider onboarding flow that creates user accounts for verified external providers.

2. **Course version flexibility:** If the data source cannot provide versions, consider:
   - A default version convention (e.g., "latest", "current") — requires documented approval.
   - Making `source_version` optional in the unique constraint — requires explicit migration.

3. **District expansion:** If Navi Mumbai is confirmed as a sub-district or needs its own entry, follow official government district redefinition process.

---

## 11. EVIDENCE REQUIRED TO RESOLVE EACH BLOCKER

| Blocker | Evidence Required | Source of Evidence |
|---|---|---|
| Course version | Official dataset version/release identifier | Data provider / source organization |
| Aurangabad mapping | Government order confirming rename to Chhatrapati Sambhajinagar | Government of Maharashtra notification |
| Mumbai mapping | Clarification of which district each entry refers to | Data provider |
| Navi Mumbai mapping | Official district definition or canonical mapping | Government of Maharashtra / data provider |
| Provider identity | Product decision on external provider representation | SkillMitra product team |
| Skill mapping | Domain expert review of 28 unmatched + 6 ambiguous skills | SkillMitra domain experts / NCS |
| Job role mapping | Domain expert review of 7 unmatched roles | SkillMitra domain experts / NCS |
| Demand provenance | Source organization, URL, date, period, methodology | Data provider |
| Employer verification | Proof of hiring partnerships, source, observation period | Data provider / employer |
| General provenance | Official source URL, license, methodology, retrieval date | Data provider |

---

## 12. TESTS AND VALIDATION

### Run during Phase 6.6
- No canonical table modifications performed.
- No fake records created.
- No schema changes applied.

### Recommended verification
- `pytest -q` — confirm no regressions in existing tests.
- `alembic current` — confirm migration state unchanged.
- `GET /health` — confirm API operational.

---

## 13. CONCLUSION

Phase 6.6 investigation is complete. **No data was imported.** All blockers from Phase 6.5 have been analyzed and classified:

| Blocker | Status | Action Required |
|---|---|---|
| 1. Course version | INSUFFICIENT_EVIDENCE | Obtain official version from source |
| 2. District mapping | REVIEW_REQUIRED | Expert review + official confirmation for 3 districts |
| 3. Provider identity | INSUFFICIENT_EVIDENCE | Product decision + possible schema change |
| 4. Skill mapping | REVIEW_REQUIRED | Domain expert review |
| 5. Job role mapping | REVIEW_REQUIRED | Domain expert review |
| 6. Market demand | BLOCKED | Obtain provenance metadata |
| 7. Employers | BLOCKED | Obtain verification evidence |
| 8. Placement data | RESOLVED (NO ACTION) | Aggregate stats only |
| 9. Provenance | PARTIAL | Obtain official source metadata |

**Next steps:** Resolve the evidence gaps identified above before any canonical import is attempted. The mapping artifacts (district mapping, skill mapping, job role mapping) are prepared for expert review.
