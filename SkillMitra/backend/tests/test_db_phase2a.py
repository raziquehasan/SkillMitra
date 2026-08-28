"""
Phase 2A database verification tests.

Run with:
    pytest tests/test_db_phase2a.py -v

Requires:
    - DATABASE_URL set in .env
    - alembic upgrade head already executed
"""

import pytest
from sqlalchemy import inspect, text
from app.core.database import engine, verify_connection


# ─────────────────────────────────────────────────────────────────
# Connectivity
# ─────────────────────────────────────────────────────────────────

def test_database_is_reachable():
    """Basic smoke test: can we connect and execute a query?"""
    assert verify_connection() is True


# ─────────────────────────────────────────────────────────────────
# Table existence
# ─────────────────────────────────────────────────────────────────

PHASE_2A_TABLES = [
    # Geography
    "states",
    "districts",
    # Skills
    "skill_proficiency_levels",
    "skill_categories",
    "skills",
    "skill_aliases",
    # Identity
    "users",
    "candidate_profiles",
    "candidate_education_history",
    "candidate_career_interests",
    # Career & Training
    "job_roles",
    "job_role_skills",
    "courses",
    "course_skills",
    "course_enrollments",
]


def test_all_phase2a_tables_exist():
    """All 14 Phase 2A tables must be present in the public schema."""
    inspector = inspect(engine)
    existing = set(inspector.get_table_names(schema="public"))
    missing = [t for t in PHASE_2A_TABLES if t not in existing]
    assert not missing, f"Missing tables: {missing}"


@pytest.mark.parametrize("table", PHASE_2A_TABLES)
def test_table_has_rows_column_or_is_empty(table):
    """Each table can be queried without error (even if empty)."""
    with engine.connect() as conn:
        result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
        count = result.scalar()
    assert count is not None


# ─────────────────────────────────────────────────────────────────
# Constraint verification
# ─────────────────────────────────────────────────────────────────

def test_skill_aliases_alias_is_unique():
    """skill_aliases.alias must have a unique constraint."""
    inspector = inspect(engine)
    uq_constraints = inspector.get_unique_constraints("skill_aliases", schema="public")
    uq_columns = [col for uc in uq_constraints for col in uc["column_names"]]
    assert "alias" in uq_columns, "UNIQUE constraint missing on skill_aliases.alias"


def test_candidate_profiles_user_id_is_unique():
    """candidate_profiles.user_id must be unique (enforces 1:1 with users)."""
    inspector = inspect(engine)
    uq_constraints = inspector.get_unique_constraints("candidate_profiles", schema="public")
    uq_columns = [col for uc in uq_constraints for col in uc["column_names"]]
    assert "user_id" in uq_columns, "UNIQUE constraint missing on candidate_profiles.user_id"


def test_course_enrollments_candidate_course_unique():
    """(candidate_id, course_id) must be unique in course_enrollments."""
    inspector = inspect(engine)
    uq_constraints = inspector.get_unique_constraints("course_enrollments", schema="public")
    uq_col_sets = [tuple(sorted(uc["column_names"])) for uc in uq_constraints]
    assert tuple(sorted(["candidate_id", "course_id"])) in uq_col_sets, (
        "UNIQUE constraint missing on (candidate_id, course_id) in course_enrollments"
    )


def test_check_constraints_exist():
    """Verify key check constraints are present in the DB."""
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT conname
            FROM pg_constraint
            WHERE contype = 'c'
              AND conrelid IN (
                  'job_role_skills'::regclass,
                  'courses'::regclass,
                  'course_enrollments'::regclass
              )
        """))
        check_names = {row[0] for row in result}

    expected = {
        "ck_job_role_skills_importance",
        "ck_courses_status",
        "ck_courses_delivery_mode",
        "ck_course_enrollments_status",
    }
    missing = expected - check_names
    assert not missing, f"Missing check constraints: {missing}"


# ─────────────────────────────────────────────────────────────────
# FK verification (spot-checks)
# ─────────────────────────────────────────────────────────────────

def test_districts_has_fk_to_states():
    inspector = inspect(engine)
    fks = inspector.get_foreign_keys("districts", schema="public")
    referred = {fk["referred_table"] for fk in fks}
    assert "states" in referred


def test_candidate_profiles_has_fk_to_users():
    inspector = inspect(engine)
    fks = inspector.get_foreign_keys("candidate_profiles", schema="public")
    referred = {fk["referred_table"] for fk in fks}
    assert "users" in referred


def test_job_role_skills_has_fks():
    inspector = inspect(engine)
    fks = inspector.get_foreign_keys("job_role_skills", schema="public")
    referred = {fk["referred_table"] for fk in fks}
    assert "job_roles" in referred
    assert "skills" in referred
    assert "skill_proficiency_levels" in referred


def test_skill_aliases_has_fk_to_skills():
    inspector = inspect(engine)
    fks = inspector.get_foreign_keys("skill_aliases", schema="public")
    referred = {fk["referred_table"] for fk in fks}
    assert "skills" in referred
