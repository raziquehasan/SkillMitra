# SkillMitra — Relationships Reference

**SIH 2026 — Problem Statement 26134**  
**Phase 1: Database Architecture Design (Final Revision)**

---

## 1. One-to-One / Primary Relationships

- `users` ↔ `candidate_profiles` (1:1)
- `users` ↔ `employers` (1:1)
- `users` ↔ `training_providers` (1:1)
- `course_enrollments` → `placements` (1:0..1)
  - *Reason*: Trainees who complete the course have exactly zero or one primary placement outcome logged. Represented via a unique foreign key constraint `enrollment_id` on the `placements` table.

---

## 2. One-to-Many Relationships

### Identity, Profiles & Geography
- `candidate_profiles` → `candidate_education_history` (1:Many)
  - *Reason*: Tracks student academic background (10th/12th stream/percentage) to feed candidate career guidance models.
- `candidate_profiles` → `candidate_career_interests` (1:Many)
  - *Reason*: Stores stated career preferences.
- `states` → `districts` (1:Many)

### Skill Taxonomy & Job Market
- `skill_proficiency_levels` → references from `job_role_skills`, `job_posting_skills`, `candidate_skills`, `course_skills`, `curriculum_skills`, `trainer_skills`
  - *Reason*: Standardizes skill levels globally.
- `skills` → `skill_aliases` (1:Many, unique alias)
  - *Reason*: Maps alternate names (JS, Javascript) to a single canonical skill (JavaScript).
- `job_roles` → `job_postings` (1:Many)
- `job_roles` → `placements` (1:Many)

### Job Applications & Placements Flow
- `candidate_profiles` → `applications` (1:Many)
  - *Reason*: Tracks candidate job applications.
- `job_postings` → `applications` (1:Many)
  - *Reason*: Link applications to standard job vacancies.
- `applications` → `placements` (1:0..1)
  - *Reason*: One successful application leads to exactly one placement record.
- `job_postings` → `placements` (1:Many)
  - *Reason*: Connects placements directly back to the original hiring vacancies they fulfilled.

### Ingestion & Aggregation Flow
- `job_postings` → `demand_signals` (1:Many)
  - *Reason*: Tracks raw job postings as weighted demand signals.
- `employer_survey_responses` → `demand_signals` (1:Many)
  - *Reason*: Tracks raw survey responses as weighted demand signals.
- `demand_signals` → **[Aggregation Process]** → `industry_demand`
  - *Note*: This is not a transactional parent-child relationship. `industry_demand` is a periodically generated analytical table resulting from the aggregation process over `demand_signals`.

### Recommendations & Outcomes
- `candidate_profiles` → `candidate_recommendations` (1:Many)
- `candidate_recommendations` → `candidate_recommendation_items` (1:Many)
  - *Reason*: Tracks recommended courses and job roles. Each item maps to exactly one target (course or job role) via a Check constraint.
- `candidate_profiles` → `course_enrollments` (1:Many)
- `courses` → `course_enrollments` (1:Many)
  - *Reason*: Monitors candidate progression through training (`enrolled`, `completed`, `dropped`).

---

## 3. Many-to-Many Relationships (Junction Tables)

### `job_role_skills` — Job Roles ↔ Skills
- *Reason*: The canonical requirement definition map. Connects a standardized job role to the skills it requires, with target proficiency level, importance (mandatory, preferred, nice_to_have), and years of experience.
- *Keys*: (`job_role_id`, `skill_id`)

### `job_posting_skills` — Job Postings ↔ Skills
- *Reason*: Mapped skills required in individual vacancies.
- *Keys*: (`job_posting_id`, `skill_id`)

### `candidate_skills` — Candidates ↔ Skills
- *Reason*: Current skill profiles of candidates.
- *Keys*: (`candidate_id`, `skill_id`)

### `course_skills` — Courses ↔ Skills
- *Reason*: Skill coverage of academic or vocational courses.
- *Keys*: (`course_id`, `skill_id`)

### `trainer_skills` — Trainers ↔ Skills
- *Reason*: Trainer capacity mapping.
- *Keys*: (`trainer_id`, `skill_id`)

### `curriculum_skills` — Curricula ↔ Skills
- *Reason*: Mapped skills inside a course curriculum version.
- *Keys*: (`curriculum_id`, `skill_id`)

---

## 4. Complete Student-to-Placement Journey Verification

The schema successfully represents this complete journey without gaps:

```
[Student Profile] (candidate_profiles)
    ↓
[Education History] (candidate_education_history)  -- 10th/12th/Grad education records
    ↓
[Career Interest] (candidate_career_interests)      -- target roles preferred
    ↓
[Job Role] (job_roles)
    ↓
[Required Skills] (job_role_skills)                 -- canonical requirements definition
    ↓
[Current Skills] (candidate_skills)                 -- vs candidate possessed skills
    ↓
[Skill Gap] (skill_gaps)                            -- derived delta
    ↓
[Recommendation] (candidate_recommendations)       -- course recommendation generated
    ↓
[Course Skills] (course_skills)                     -- courses teaching matching skills
    ↓
[Training Status] (course_enrollments)              -- enroll, complete, drop status
    ↓
[Job Application] (applications)                    -- application to posting
    ↓
[Job Posting] (job_postings)                        -- vacancy in matching job role
    ↓
[Placement] (placements)                            -- hired outcome (linked to enrollment & application)
```

**Verify Verification:** Every step is linked by standard Foreign Key relationships. No orphaned tables or paths exist in this pipeline.
