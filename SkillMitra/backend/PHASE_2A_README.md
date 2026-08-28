# SkillMitra Phase 2A: Database Implementation

This directory now contains the Phase 2A database foundation using SQLAlchemy 2.x and Alembic.

## Implemented Models (14 Tables)
Only the specified Phase 2A tables have been implemented exactly as per Phase 1 docs:
- Geography: `states`, `districts`
- Skills: `skill_proficiency_levels`, `skill_categories`, `skills`, `skill_aliases`
- Identity: `users`, `candidate_profiles`, `candidate_education_history`, `candidate_career_interests`
- Career: `job_roles`, `job_role_skills`, `courses`, `course_skills`, `course_enrollments`

## Local PostgreSQL Setup
During this phase, a local PostgreSQL instance was initialized in the `SkillMitra\pgdata` folder running on port `5433` because the default PostgreSQL on port `5432` required an unknown password.

To start the database server:
```powershell
"C:\Program Files\PostgreSQL\17\bin\postgres.exe" -D "C:\Users\asus\OneDrive\Desktop\SkillMitra\SkillMitra\pgdata" -p 5433
```
(It is currently running in the background of this session).

## Verify the Database
All tables, constraints, and relationships have been tested and verified via pytest:
```powershell
.\.venv\Scripts\Activate.ps1
pytest tests/test_db_phase2a.py -v
```

## Alembic
The migration `af28c83b5457_phase2a_core_tables.py` has been generated and successfully applied via `alembic upgrade head`.
