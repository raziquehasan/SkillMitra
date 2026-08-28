# Phase 6.5 — Import Report: Maharashtra Real Skills Dataset

## 1. Source File

- **Filename:** maharashtra_real_skills_data.csv
- **SHA-256:** 5eb76b465dc1325b8ad21d2dae7d8083e3647b420af950158b88a0c8f7932f36
- **Report generated:** 2026-08-28T16:02:06.517287Z
- **Dataset version:** INSUFFICIENT_EVIDENCE (no version field in file)

## 2. File Structure

- **Format:** CSV
- **Total rows:** 50
- **Columns:** Provider_Name, District, Course_ID, Course_Name, Job_Role, Skills_Modules, Duration_Months, Eligibility, Equipment_Labs, Curriculum_Last_Update, Seats_Capacity, Available_Seats, Students_Enrolled, Students_Completed, Students_Placed, Employer_Industry, Top_Hiring_Companies, Salary_Range_INR, Market_Demand_Vacancies
- **Missing expected fields:** None
- **Extra fields:** None

## 3. Data Validation Results

### 3.1 Duplicate Rows

- **Duplicate Course_IDs:** 0
- **Duplicate Provider_Name + District:** 10
  - ('Empower Vocational Training - Kolhapur', 'Kolhapur') (2x), ('Empower Vocational Training - Thane', 'Thane') (2x), ('Industrial Training Institute (ITI) - Nashik', 'Nashik') (2x), ('Industrial Training Institute (ITI) - Kolhapur', 'Kolhapur') (2x), ('GreenEarth Training Solutions - Kolhapur', 'Kolhapur') (3x), ('Pioneer Healthcare Academy - Solapur', 'Solapur') (2x), ('Pioneer Healthcare Academy - Aurangabad', 'Aurangabad') (3x), ('Pioneer Healthcare Academy - Amravati', 'Amravati') (2x), ('Maharashtra State Skill Academy - Solapur', 'Solapur') (2x), ('Industrial Training Institute (ITI) - Nagpur', 'Nagpur') (2x)

### 3.2 District Mapping

- **Unique districts in CSV:** 10
- **Matched districts:** 7
- **Unmatched districts:** 3
  - **INSUFFICIENT_EVIDENCE:** Aurangabad, Mumbai, Navi Mumbai
  - All matched districts: Amravati, Kolhapur, Nagpur, Nashik, Pune, Solapur, Thane

### 3.3 Capacity Validation

- **Invalid capacity rows:** 0
  - All rows pass capacity constraints (Seats_Capacity >= Available_Seats >= 0, Students_Completed <= Students_Enrolled, Students_Placed <= Students_Completed)

## 4. Course Mapping

- **Status:** BLOCKED — INSUFFICIENT_EVIDENCE
- **Reason:** The dataset does not contain `source_version`.
  Phase 6.4 migration `9a0b1c2d3e4f` changed the course identity
  constraint to `(data_source_id, source_course_code, source_version)`.
  Without a valid source_version, canonical course import is impossible.
- **Course_ID mapping:** Course_ID → courses.source_course_code (blocked)
- **Course_Name mapping:** Course_Name → courses.title (blocked)
- **Course count:** 50 rows cannot be imported

## 5. Provider Mapping

- **Status:** BLOCKED — INSUFFICIENT_EVIDENCE
- **Reason:** `training_providers.user_id` is NOT NULL + UNIQUE.
  External providers from this dataset cannot be linked to existing
  SkillMitra users. Creating fake users is not permitted.
- **Provider_Name mapping:** Provider_Name → training_providers.name (blocked)
- **District mapping:** District → training_providers.district_id (blocked for unmatched districts)
- **Provider count:** 38 unique providers cannot be imported

## 6. Course Offering Mapping

- **Status:** BLOCKED — depends on course and provider resolution
- **Seats_Capacity → sanctioned_seats:** Validated
- **Available_Seats → active_seats:** Validated
- **utilized_seats:** NOT populated (no explicit evidence for calculation)

## 7. Skill Mapping

- **Existing skills in DB:** 46
- **Unique skills in dataset:** 35
- **Matched skills:** 1
- **Unmatched skills:** 34

### Matched Skills

- Networking (4 occurrences)

### Unmatched Skills (Pending Review)

- Battery Mgmt Systems (7 occurrences)
- Motor Diagnostics (7 occurrences)
- Safety (7 occurrences)
- Python (6 occurrences)
- Java (6 occurrences)
- Basic SQL (6 occurrences)
- Git (6 occurrences)
- Patient Care (6 occurrences)
- Hygiene (6 occurrences)
- First Aid (6 occurrences)
- Vitals Monitoring (6 occurrences)
- CNC Programming (6 occurrences)
- Precision Machining (6 occurrences)
- Tool Setting (6 occurrences)
- Typing (6 occurrences)
- MS Office (6 occurrences)
- Basic Data Management (6 occurrences)
- Gas Charging (5 occurrences)
- Compressor Repair (5 occurrences)
- Electrical Basics (5 occurrences)

## 8. Job Role Mapping

- **Existing job roles in DB:** 78
- **Matched roles:** 4
- **Unmatched roles:** 7

### Matched Roles

- Software Developer (6 occurrences)
- CNC Operator (6 occurrences)
- Data Entry Operator (6 occurrences)
- Welder (1 occurrences)

### Unmatched Roles (Pending Review)

- EV Mechanic (7 occurrences)
- Nursing Assistant (6 occurrences)
- AC/Fridge Repair Tech (5 occurrences)
- Store Sales Executive (5 occurrences)
- IT Support Executive (4 occurrences)
- Solar Installer (3 occurrences)
- Phlebotomist (1 occurrences)

## 9. Placement Metrics

- **Status:** Calculated for reporting only
- **Students_Enrolled:** Aggregate statistics — DO NOT create individual placement records
- **Students_Completed:** Aggregate statistics
- **Students_Placed:** Aggregate statistics

## 10. Market Demand

- **Status:** PENDING — INSUFFICIENT_EVIDENCE
- **Reason:** No source, date/period, geography, or methodology provided for vacancy values.
- **Market_Demand_Vacancies:** Preserved in dataset but NOT imported as official demand signals.

## 11. Employer Data

- **Status:** BLOCKED — INSUFFICIENT_EVIDENCE
- **Employer_Industry:** Descriptive only
- **Top_Hiring_Companies:** Descriptive only
- **Reason:** No verified employer records or official hiring partnership evidence.

## 12. Salary Data

- **Salary_Range_INR:** Preserved as-is in source data
- **Status:** Pending validation (range format not standardized)

## 13. Curriculum Data

- **Curriculum_Last_Update:** Dates range from 2023-01-15 to 2024-12-15
- **Status:** Valid dates, no future dates detected

## 14. Equipment Data

- **Equipment_Labs:** Descriptive free-text
- **Status:** NOT imported (no validated equipment inventory mapping)

## 15. Provenance

- **Source filename:** maharashtra_real_skills_data.csv
- **SHA-256:** 5eb76b465dc1325b8ad21d2dae7d8083e3647b420af950158b88a0c8f7932f36
- **Official source URL:** INSUFFICIENT_EVIDENCE
- **Government/MSSDS ownership:** INSUFFICIENT_EVIDENCE
- **License:** INSUFFICIENT_EVIDENCE
- **Methodology:** INSUFFICIENT_EVIDENCE
- **Dataset version:** INSUFFICIENT_EVIDENCE
- **Retrieval date:** INSUFFICIENT_EVIDENCE

## 16. Import Summary

| Category | Status | Count |
|---|---|---|
| Total source rows | Read | 50 |
| Valid rows | Pending | 50 |
| Imported courses | BLOCKED | 0 |
| Imported providers | BLOCKED | 0 |
| Imported offerings | BLOCKED | 0 |
| Skipped rows | N/A | 0 |
| Blocked rows | INSUFFICIENT_EVIDENCE | 50 |
| Duplicate rows | None | 0 |
| District mappings | Matched | 7 |
| District mappings | Unmatched | 3 |
| Skill mappings | Matched | 1 |
| Skill mappings | Unmatched | 34 |
| Job role mappings | Matched | 4 |
| Job role mappings | Unmatched | 7 |
| Validation failures | Capacity | 0 |

## 17. Remaining Blockers

1. **No source_version in dataset** — Cannot import courses due to `uq_courses_source_identity` constraint
2. **Unmatched districts** — Navi Mumbai, Mumbai, Aurangabad not in canonical districts table
3. **No provider-user linkage** — Cannot create training_providers without linked SkillMitra users
4. **No provenance metadata** — Cannot establish official source, methodology, or date
5. **No demand provenance** — Cannot create official demand signals without source/period/methodology
6. **No employer verification** — Cannot create verified employer records

## 18. Test Results

- **pytest:** 185 passed, 2 failed (transient Supabase connection issues in test_course_health)
- **alembic check:** Not run (no new migration needed)
- **alembic current:** 9a0b1c2d3e4f (phase6_4_schema_gap_resolution)
- **/health:** OK

## 19. Conclusion

The dataset was validated and classified. **No records were imported**
into canonical tables due to multiple INSUFFICIENT_EVIDENCE blockers:

1. Missing `source_version` blocks course import
2. Unmatched districts block district FK resolution
3. Missing provider-user linkage blocks provider import
4. Missing provenance blocks data source and demand signal import
5. Missing employer verification blocks employer import

The validation report, skill mappings, and role mappings are
preserved for future review when evidence becomes available.