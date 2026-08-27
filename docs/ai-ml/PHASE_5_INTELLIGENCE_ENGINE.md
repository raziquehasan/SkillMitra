# SkillMitra Phase 5 Intelligence Engine

## Architecture

Phase 5 adds deterministic analytics services over the existing SQLAlchemy 2.x and Supabase PostgreSQL schema. No LLM, paid AI API, ML model, scraping, Redis, or new dependency is used. PostgreSQL performs filtering, grouping, joins, and counts; Python assembles transparent evidence responses.

## Data Sources

Demand uses persisted `industry_demand` aggregate rows and `demand_signals`. Supply uses `course_offerings`, `course_skills`, and provider status. Outcomes use `course_enrollments`, `applications`, and `placements`. Trainer capability uses `trainers`, `trainer_skills`, curriculum versions, and curriculum skills. Equipment capability uses `equipment` and `course_equipment_requirements`.

## Implemented APIs

Government-only endpoints:

- `GET /api/v1/government/demand-evidence`
- `GET /api/v1/government/training-supply-by-skill`
- `GET /api/v1/government/training-gaps`
- `GET /api/v1/government/course-alignment/{course_id}`
- `GET /api/v1/government/placement-outcomes`
- `GET /api/v1/government/trainer-gaps/{provider_id}/{course_id}`
- `GET /api/v1/government/equipment-gaps/{provider_id}/{course_id}`
- `GET /api/v1/government/district-plans`
- `POST /api/v1/government/district-plans/generate`

The existing government training-supply route now returns persisted offering capacity; an empty result preserves the established `NOT_YET_AVAILABLE` response.

## Demand Engine

Demand evidence returns district, industry, role, skill, proficiency, period, and persisted aggregate demand value. Date filters use overlapping periods. No weights are invented and no aggregate is recalculated from incomplete sources.

## Supply Engine

For active offerings, available capacity is aggregated by course skill:

`available_capacity = max(active_seats - utilized_seats, 0)`

A course contributes its available seats to each skill explicitly mapped in `course_skills`; no equal distribution assumption is made beyond that explicit mapping.

## Demand Versus Supply

For each persisted demand row and matching district/skill supply:

`capacity_gap = demand_value - available_capacity`

Demand is an aggregate demand score, while capacity is seats without a period column. Results therefore expose the capacity definition and must be interpreted as a planning comparison, not a population-equivalent count. No oversupply classification is emitted.

## Course Alignment

`covered_skill_ids = demanded_skill_ids INTERSECT course_skill_ids`.

`uncovered_skill_ids = demanded_skill_ids - course_skill_ids`.

Status is `ALIGNED` when demanded skills exist and none are uncovered, `PARTIALLY_ALIGNED` when some are covered, and `INSUFFICIENT_DATA` when no demanded skills or coverage exists. This is not a magic course-fit score.

## Placement Engine

For an optional course:

- enrolled count: all `course_enrollments` rows
- completed count: rows with `status = completed`
- application count: persisted application rows
- placement count: placement rows linked through `placements.enrollment_id` to completed enrollments
- placement rate: `placement_count / completed_count` only when completed count is greater than zero

The response includes numerator, denominator, rate status, and rate. Course placement linkage is explicit; unlinked placements are not counted in the course rate.

## Trainer Gap Engine

For each curriculum skill requirement, an active provider trainer satisfies the requirement when the trainer has the same skill and a proficiency `rank_score` greater than or equal to the required rank. Otherwise the result is `UPSKILLING_REQUIRED`. No trainer proficiency is fabricated.

## Equipment Gap Engine

For each course requirement at a provider:

`equipment_gap = max(required_quantity - available_quantity, 0)`

Only equipment belonging to the requested provider is considered. Missing inventory rows produce no fabricated availability.

## Provider Readiness

Provider readiness is represented through persisted offerings, active capacity, trainer gaps, and equipment gaps. No combined readiness score is created.

## District Planning Engine

Plan generation accepts district and planning period, reads persisted demand rows overlapping the period, aggregates active course-offering capacity by skill, creates an auditable plan, and creates plan items containing demand, supply, and gap values. Actions are neutral evidence signals: `EXPAND_EXISTING_CAPACITY` for a positive gap and `COLLECT_MORE_DATA` otherwise. Existing same-period plans are reused; no duplicate plan is created.

## Employer Validation and Trends

Employer survey response identity exists, but current rows do not carry enough skill/proficiency or curriculum feedback for direct validation: **NOT_YET_AVAILABLE**. Emerging technology data and sector growth data are absent: **NOT_YET_AVAILABLE**. Historical trend and forecasting are not implemented because the available data does not establish a validated period series for every required scope.

## Oversupply and Obsolete Courses

Oversupply and obsolete-course detection are **NOT_YET_AVAILABLE**. Capacity greater than demand is not treated as evidence of either condition.

## Candidate Intelligence

Candidate skill ownership and proficiency-aware skill gaps from Phase 4 remain active. Candidate guidance continues to expose interest, district demand, and course evidence without claiming a best career or using an AI score.

## Security

All Phase 5 government analytics and plan operations require `government_admin`. Provider operational endpoints resolve provider ownership from the authenticated user. Candidate skill and gap endpoints require the `candidate` role and candidate-scoped queries. No private assessment evidence is included in government aggregates.

## Cost Control

LLM usage: **NOT USED**. No paid AI API, model dependency, or API key was added. Counts, sums, joins, gaps, and rates are solved with SQLAlchemy/PostgreSQL and Python deterministic rules.

## NOT_YET_AVAILABLE

- Unstructured employer validation of skills or curricula.
- Emerging technology trend ingestion.
- Forecasting and predictive demand.
- Defensible oversupply classification.
- Obsolete-course detection.
- Time-normalized capacity utilization and district population demand conversion.
- Autonomous government policy decisions.
