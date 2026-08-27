# SkillMitra Phase 4 Gap Analysis

## Audit Basis

Reviewed the frozen Phase 1 database documents, current SQLAlchemy models, API routes, services, repositories, tests, Alembic revisions, and the live Supabase PostgreSQL schema on 2026-08-27.

## Authentication and Supabase

- `users` exists in Supabase and stores `hashed_password`, never plaintext passwords.
- Passwords are hashed with Argon2 in `app/core/security.py` before persistence.
- `refresh_tokens` exists in Supabase and stores a SHA-256 hash, expiry, revocation time, and rotation link. Raw refresh tokens are returned only to the HttpOnly cookie path.
- Access JWTs are signed, short-lived, and stateless. They are not stored in Supabase. This is intentional; refresh-token rotation provides server-side session persistence and revocation.
- `DATABASE_URL` points to Supabase PostgreSQL and SQLAlchemy/Alembic use it directly. Supabase Auth and Supabase REST are not used.
- Production hardening required: replace the default JWT secret and enable secure cookies over HTTPS.

## Existing and Missing Entities

| Entity | Live table / ORM | Phase 1 documented | SIH relevance | Phase 4 decision |
|---|---|---:|---:|---|
| `candidate_skills` | No / No | Yes | Required | Create normalized table |
| assessment evidence | No / No | Yes, as assessment family | Required for verification | Create minimal candidate skill evidence fields; no file storage |
| `skill_gaps` | No / No | Yes, derived | Required | Derive at query time; do not persist snapshots |
| `curricula` | No / No | Yes | Required | Create versioned curriculum tables |
| `curriculum_skills` | No / No | Yes | Required | Create junction table |
| course-curriculum mapping | No / No | Partial course model | Required | Add version FK to courses |
| `training_providers` | No / No | Yes | Required | Create provider table |
| provider course offering | No / No | Implied | Required | Create offering table with seats |
| trainers / trainer skills | No / No | Yes | Required | Create normalized tables |
| equipment / requirements | No / No | Yes | Required | Create inventory and requirement tables |
| district training plans | No / No | Yes, derived | Required | Create auditable planning tables |
| demand, jobs, courses, enrollments, applications, placements | Yes / Yes | Yes | Required inputs | Reuse existing tables |
| employer surveys | Yes / Yes | Yes | Partial | Reuse; dedicated validation remains unsupported |
| emerging technology trends | No / No | Yes, future | Future | Do not create fake trend data |

## Design Decisions

- Candidate skill gaps remain derived from `candidate_skills` and canonical `job_role_skills`.
- Curriculum versions are immutable historical records; a course points to its current curriculum version.
- Provider capacity is represented as provider-course offerings with positive seat counts and district FK. No batch scheduling is added.
- Trainer and equipment records belong to a provider and use status fields instead of destructive deletion.
- District plans store planning period, scope, and auditable status. Calculated demand/supply values are only populated by explicit deterministic services after validating their source period and scope.
- Every cross-entity relationship uses an explicit PostgreSQL foreign key. No polymorphic source IDs are introduced.

## No Schema Change Has Been Applied

This document precedes the Phase 4 design and migration. The migration must be reviewed with its exact tables, columns, foreign keys, constraints, and indexes before applying it to Supabase.
