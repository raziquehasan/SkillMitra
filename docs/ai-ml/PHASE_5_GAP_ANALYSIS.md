# SkillMitra Phase 5 Gap Analysis

## Audit

The repository is clean on `main` and Phase 4 is applied to Supabase PostgreSQL. Existing reusable sources are `demand_signals`, `industry_demand`, `job_roles`, `job_role_skills`, `skills`, `skill_proficiency_levels`, `courses`, `course_skills`, `course_enrollments`, `applications`, `placements`, `candidate_skills`, `curricula`, `curriculum_versions`, `curriculum_skills`, `training_providers`, `course_offerings`, `trainers`, `trainer_skills`, `equipment`, `course_equipment_requirements`, `district_training_plans`, and `district_training_plan_items`.

## Existing API and Service Surface

Demand routes already expose raw and aggregate demand filters. Phase 4 routes expose candidate skills, provider profiles, offerings, trainers, equipment, and curriculum reads. Existing services cover candidates, courses, jobs, applications, and authentication. There is no shared Phase 5 analytics service, no trainer/equipment gap API, no course alignment view, and no deterministic plan-generation service.

## Phase 5 Implementation Scope

Implement a read-oriented analytics service and government APIs for:

- Demand evidence by district, role, skill, proficiency, and period.
- Training supply by district, course, provider, and available seats.
- Demand versus available supply using matching district/skill and an explicit period.
- Course alignment: demanded skills versus course skills and relevant roles.
- Placement outcome counts and a rate only for completed-enrollment cohorts where placement enrollment linkage is present.
- Trainer proficiency gaps against curriculum-version skills.
- Equipment quantity gaps against course requirements.
- Provider readiness as structured statuses, not a score.
- District plan generation from actual demand and supply rows with evidence fields.

## Data Limitations

Demand values are persisted aggregate scores, not candidate counts. Capacity has no period, so demand-versus-supply is only reported when the caller supplies a period and the result is labelled as a cross-period capacity comparison. Employer survey rows do not contain skill/proficiency requirements, so employer validation is **NOT_YET_AVAILABLE**. Emerging technology trends, forecasting, obsolete-course detection, and oversupply classification are **NOT_YET_AVAILABLE**.

## Formulas

- `available_capacity = max(active_seats - utilized_seats, 0)`.
- `capacity_gap = demand_value - available_capacity`.
- Course demanded coverage = `course_skills.skill_id INTERSECT demanded industry_demand.skill_id`.
- Equipment gap = `max(required_quantity - available_quantity, 0)`.
- Trainer gap exists when no active trainer skill for the provider has rank at least the curriculum required proficiency rank.
- Placement rate, when course-scoped and linked through `placements.enrollment_id`, is `placed_count / completed_count` only when `completed_count > 0`; otherwise rate is unavailable.

## Security

Government analytical APIs require `government_admin`. Provider readiness and trainer/equipment details are provider-owned. Candidate skills and gaps remain candidate-owned. No private assessment evidence is exposed in government aggregate results.
