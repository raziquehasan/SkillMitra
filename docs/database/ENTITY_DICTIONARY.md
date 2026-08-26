# SkillMitra — Entity Dictionary

**SIH 2026 — Problem Statement 26134**  
**Phase 1: Database Architecture Design (Final Revision)**

---

## Table of Contents

1. [Identity & Organization](#1-identity--organization)
2. [Geography](#2-geography)
3. [Industry](#3-industry)
4. [Skill Taxonomy](#4-skill-taxonomy)
5. [Job Market & Applications](#5-job-market--applications)
6. [Courses & Outcomes](#6-courses--outcomes)
7. [Candidate Skills & Assessment](#7-candidate-skills--assessment)
8. [Recommendation Engine](#8-recommendation-engine)
9. [Skill Gap](#9-skill-gap)
10. [Industry Demand](#10-industry-demand)
11. [Employer Validation](#11-employer-validation)
12. [Placement Outcomes](#12-placement-outcomes)
13. [Curriculum](#13-curriculum)
14. [Training Capacity](#14-training-capacity)
15. [District Planning](#15-district-planning)
16. [Data Ingestion](#16-data-ingestion)

---

## 1. Identity & Organization

### `users`
- **Purpose**: Core authentication and identity record for all individuals.
- **Type**: Transactional
- **Attributes**: `id` (UUID PK), `email` (string), `full_name` (string), `phone` (string), `is_active` (boolean), `created_at` (timestamp), `updated_at` (timestamp).

### `roles`
- **Purpose**: Registry of available system access roles.
- **Type**: Reference
- **Attributes**: `id` (UUID PK), `name` (string), `description` (string).

### `user_roles`
- **Purpose**: Junction mapping users to roles.
- **Type**: Junction
- **Attributes**: `user_id` (UUID FK), `role_id` (UUID FK), `assigned_at` (timestamp).

### `candidate_profiles`
- **Purpose**: Profiles representing students/trainees (canonical: candidates).
- **Type**: Transactional
- **Attributes**: `id` (UUID PK), `user_id` (UUID FK), `district_id` (UUID FK), `date_of_birth` (date), `education_level` (string), `current_status` (string), `created_at` (timestamp), `updated_at` (timestamp).

### `candidate_education_history`
- **Purpose**: Individual school/college history, specifically to support guidance for 10th/12th students.
- **Type**: Transactional
- **Attributes**: `id` (UUID PK), `candidate_id` (UUID FK), `education_level` (string, e.g., 10th, 12th, Graduate), `stream_specialization` (string, e.g., Science, Commerce, Arts, Vocational), `institution_name` (string), `board_university` (string), `passing_year` (integer), `marks_percentage` (float).

### `candidate_career_interests`
- **Purpose**: Explicitly maps candidate's career interests and preferences for recommendations.
- **Type**: Transactional
- **Attributes**: `id` (UUID PK), `candidate_id` (UUID FK), `target_job_role_id` (UUID FK), `preference_rank` (integer), `notes` (text).

### `employers`
- **Purpose**: Employer details.
- **Type**: Transactional
- **Attributes**: `id` (UUID PK), `user_id` (UUID FK), `industry_sector_id` (UUID FK), `district_id` (UUID FK), `company_name` (string), `website` (string), `size_category` (string), `is_verified` (boolean), `created_at` (timestamp).

### `training_providers`
- **Purpose**: Providers delivering courses and mapping curriculum.
- **Type**: Transactional
- **Attributes**: `id` (UUID PK), `user_id` (UUID FK), `district_id` (UUID FK), `name` (string), `registration_number` (string), `contact_email` (string), `is_verified` (boolean), `created_at` (timestamp).

---

## 2. Geography

### `states`
- **Purpose**: State list. Maharashtra is primary.
- **Type**: Reference
- **Attributes**: `id` (UUID PK), `name` (string), `code` (string).

### `districts`
- **Purpose**: Standard district catalog for hyper-local training and job mapping.
- **Type**: Reference
- **Attributes**: `id` (UUID PK), `state_id` (UUID FK), `name` (string), `code` (string).

---

## 3. Industry

### `industry_sectors`
- **Purpose**: Reusable classification of industry domains.
- **Type**: Reference
- **Attributes**: `id` (UUID PK), `name` (string), `code` (string), `description` (text).

---

## 4. Skill Taxonomy

### `skill_proficiency_levels`
- **Purpose**: Centralized reference table defining standardized proficiency levels.
- **Type**: Reference
- **Attributes**: `id` (UUID PK), `code` (string, e.g., BEG, INT, ADV, EXP), `name` (string, e.g., Beginner), `rank_score` (integer, e.g., 1, 2, 3, 4).

### `skill_categories`
- **Purpose**: Classification groups for skills.
- **Type**: Reference
- **Attributes**: `id` (UUID PK), `name` (string), `description` (text).

### `skills`
- **Purpose**: Canonical skill register.
- **Type**: Reference
- **Attributes**: `id` (UUID PK), `category_id` (UUID FK), `name` (string), `skill_type` (string), `is_emerging` (boolean), `is_active` (boolean), `description` (text), `created_at` (timestamp).

### `skill_aliases`
- **Purpose**: Maps alternate names to canonical skills. Enforces global uniqueness of alias spelling.
- **Type**: Reference
- **Attributes**: `id` (UUID PK), `skill_id` (UUID FK), `alias` (string UNIQUE).

---

## 5. Job Market & Applications

### `job_roles`
- **Purpose**: Standardised titles for career paths and requirements matching.
- **Type**: Reference
- **Attributes**: `id` (UUID PK), `industry_sector_id` (UUID FK), `title` (string), `description` (text), `is_active` (boolean).

### `job_role_skills`
- **Purpose**: Junction table defining the canonical skill requirements for a standardized job role.
- **Type**: Junction
- **Attributes**: `job_role_id` (UUID FK), `skill_id` (UUID FK), `proficiency_level_id` (UUID FK), `importance` (string, e.g., mandatory, preferred, nice_to_have), `years_experience_required` (integer).

### `job_postings`
- **Purpose**: Individual job listings scraped or uploaded.
- **Type**: Transactional
- **Attributes**: `id` (UUID PK), `employer_id` (UUID FK), `job_role_id` (UUID FK), `district_id` (UUID FK), `data_source_id` (UUID FK), `title` (string), `status` (string), `posted_date` (date), `closed_date` (date), `experience_min` (string), `experience_max` (string), `created_at` (timestamp).

### `job_posting_skills`
- **Purpose**: Mapped required skills per specific job posting.
- **Type**: Junction
- **Attributes**: `job_posting_id` (UUID FK), `skill_id` (UUID FK), `proficiency_level_id` (UUID FK), `importance` (string), `years_experience` (integer).

### `applications`
- **Purpose**: Tracks job applications submitted by candidates.
- **Type**: Transactional
- **Attributes**: `id` (UUID PK), `candidate_id` (UUID FK), `job_posting_id` (UUID FK), `status` (string, e.g., applied, screening, interviewing, offered, rejected), `applied_at` (timestamp), `updated_at` (timestamp).

---

## 6. Courses & Outcomes

### `qualifications`
- **Purpose**: Award levels or certifications linked to training.
- **Type**: Reference
- **Attributes**: `id` (UUID PK), `name` (string), `issuing_body` (string), `level` (string), `description` (text).

### `courses`
- **Purpose**: Academic/vocational training courses.
- **Type**: Transactional
- **Attributes**: `id` (UUID PK), `provider_id` (UUID FK), `district_id` (UUID FK), `title` (string), `description` (text), `status` (string), `duration_hours` (integer), `training_level` (string), `delivery_mode` (string), `created_at` (timestamp), `updated_at` (timestamp).

### `course_skills`
- **Purpose**: Junction mapping skills covered in a course.
- **Type**: Junction
- **Attributes**: `course_id` (UUID FK), `skill_id` (UUID FK), `proficiency_level_id` (UUID FK), `is_primary` (boolean).

### `course_qualifications`
- **Purpose**: Junction mapping certifications associated with a course.
- **Type**: Junction
- **Attributes**: `course_id` (UUID FK), `qualification_id` (UUID FK).

### `course_enrollments`
- **Purpose**: Tracks candidate training progression and outcomes.
- **Type**: Transactional
- **Attributes**: `id` (UUID PK), `candidate_id` (UUID FK), `course_id` (UUID FK), `status` (string, e.g., enrolled, completed, dropped), `enrollment_date` (date), `completion_date` (date), `grade_outcome` (string).

---

## 7. Candidate Skills & Assessments

### `candidate_skills`
- **Purpose**: Candidate's profile skills.
- **Type**: Transactional
- **Attributes**: `id` (UUID PK), `candidate_id` (UUID FK), `skill_id` (UUID FK), `proficiency_level_id` (UUID FK), `source` (string), `is_verified` (boolean), `last_assessed_date` (date), `created_at` (timestamp).

### `assessments`, `assessment_questions`, `assessment_options`, `assessment_attempts`, `assessment_answers`
- **Purpose**: Tracks skill evaluations.
- **Type**: Transactional

---

## 8. Recommendation Engine

### `candidate_recommendations`
- **Purpose**: Persisted record of recommendation engine runs for candidates.
- **Type**: Transactional
- **Attributes**: `id` (UUID PK), `candidate_id` (UUID FK), `recommendation_type` (string, e.g., course, job_role, career_path), `rationale` (text), `generated_at` (timestamp).

### `candidate_recommendation_items`
- **Purpose**: The specific items (courses or roles) recommended.
- **Type**: Transactional
- **Attributes**: `id` (UUID PK), `recommendation_id` (UUID FK), `course_id` (UUID FK, nullable), `job_role_id` (UUID FK, nullable), `score_rank` (float).
- **Constraints**: Enforces PostgreSQL check constraint: `(course_id IS NOT NULL AND job_role_id IS NULL) OR (course_id IS NULL AND job_role_id IS NOT NULL)`.

---

## 9. Skill Gap

### `skill_gaps`
- **Purpose**: Delta records between candidate skills and targeted job role requirements.
- **Type**: Derived
- **Attributes**: `id` (UUID PK), `candidate_id` (UUID FK), `job_role_id` (UUID FK), `skill_id` (UUID FK), `current_proficiency_id` (UUID FK), `required_proficiency_id` (UUID FK), `gap_score` (integer), `identified_at` (timestamp), `updated_at` (timestamp).

---

## 10. Industry Demand

### `demand_signals`
- **Purpose**: Standardized, raw data records representing market demand signals with configurable weights per source. Enforces referential integrity using direct foreign keys.
- **Type**: Transactional / Staging
- **Attributes**: `id` (UUID PK), `skill_id` (UUID FK), `job_role_id` (UUID FK, nullable), `district_id` (UUID FK), `job_posting_id` (UUID FK, nullable), `survey_response_id` (UUID FK, nullable), `raw_weight` (float), `scaled_weight` (float), `detected_at` (timestamp).
- **Constraints**: Enforces PostgreSQL check constraint: `(job_posting_id IS NOT NULL AND survey_response_id IS NULL) OR (job_posting_id IS NULL AND survey_response_id IS NOT NULL)`.

### `industry_demand`
- **Purpose**: Aggregated/derived analytical rollup calculated from weighted `demand_signals` via an aggregation process.
- **Type**: Analytical
- **Attributes**: `id` (UUID PK), `skill_id` (UUID FK), `job_role_id` (UUID FK, nullable), `industry_sector_id` (UUID FK), `district_id` (UUID FK), `proficiency_level_id` (UUID FK), `aggregate_demand_score` (float), `period_start` (date), `period_end` (date), `generated_at` (timestamp).

---

## 11. Employer Validation

### `employer_surveys`, `employer_survey_responses`
- **Purpose**: Tracks surveys conducted with employers.
- **Type**: Transactional

---

## 12. Placement Outcomes

### `placements`
- **Purpose**: Records actual successful candidate placement events. Statuses represent actual employment states only (no unplaced status). Cardinality with `course_enrollments` is 0..1.
- **Type**: Transactional
- **Attributes**: `id` (UUID PK), `candidate_id` (UUID FK), `employer_id` (UUID FK), `job_role_id` (UUID FK), `enrollment_id` (UUID FK, references course_enrollments, UNIQUE), `job_posting_id` (UUID FK, nullable), `application_id` (UUID FK, nullable), `district_id` (UUID FK), `placement_date` (date), `outcome_status` (string, e.g., placed_full_time, placed_part_time, self_employed, apprenticeship), `salary_range` (string), `created_at` (timestamp).

---

## 13. Curriculum

### `curricula`, `curriculum_skills`
- **Purpose**: Tracks versioned course curricula.
- **Type**: Transactional

### `curriculum_skill_recommendations`
- **Purpose**: Actionable updates to curriculum skill coverage.
- **Type**: Transactional
- **Attributes**: `id` (UUID PK), `curriculum_id` (UUID FK), `skill_id` (UUID FK), `target_proficiency_level_id` (UUID FK), `recommendation_type` (string, e.g., add_skill, remove_skill, increase_proficiency), `rationale` (text), `status` (string), `created_at` (timestamp).

### `curriculum_capacity_recommendations`
- **Purpose**: Recommendations for infrastructure, trainers, and equipment upgrades.
- **Type**: Transactional
- **Attributes**: `id` (UUID PK), `curriculum_id` (UUID FK), `equipment_id` (UUID FK, nullable), `trainer_requirement_specialization` (string, nullable), `recommendation_type` (string, e.g., update_equipment, update_trainer), `details` (text), `rationale` (text), `status` (string), `created_at` (timestamp).

---

## 14. Training Capacity

### `trainers`, `trainer_skills`, `equipment`, `course_equipment`
- **Purpose**: Physical and human resource tracking.
- **Type**: Transactional

---

## 15. District Planning

### `district_training_plans`, `district_training_plan_courses`
- **Purpose**: Aggregated strategic training deployment maps.
- **Type**: Derived

---

## 16. Data Ingestion

### `data_sources`, `data_ingestion_runs`
- **Purpose**: Tracking ingestion runs.
- **Type**: Operational
