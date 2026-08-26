"""
Phase 2B database verification tests.
"""

import pytest
from sqlalchemy import inspect, text
from app.core.database import engine


PHASE_2B_TABLES = [
    "employers",
    "job_postings",
    "job_posting_skills",
    "applications",
    "placements",
]

def test_all_phase2b_tables_exist():
    inspector = inspect(engine)
    existing = set(inspector.get_table_names(schema="public"))
    missing = [t for t in PHASE_2B_TABLES if t not in existing]
    assert not missing, f"Missing tables: {missing}"


@pytest.mark.parametrize("table", PHASE_2B_TABLES)
def test_table_has_rows_column_or_is_empty(table):
    with engine.connect() as conn:
        result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
        count = result.scalar()
    assert count is not None


def test_unique_constraints_exist():
    inspector = inspect(engine)
    
    # employers: user_id unique
    uq_emp = inspector.get_unique_constraints("employers", schema="public")
    assert any("user_id" in uc["column_names"] for uc in uq_emp)
    
    # placements: enrollment_id unique, application_id unique
    uq_place = inspector.get_unique_constraints("placements", schema="public")
    assert any("enrollment_id" in uc["column_names"] for uc in uq_place)
    assert any("application_id" in uc["column_names"] for uc in uq_place)


def test_composite_pk_exists():
    inspector = inspect(engine)
    pk = inspector.get_pk_constraint("job_posting_skills", schema="public")
    assert set(pk["constrained_columns"]) == {"job_posting_id", "skill_id"}


def test_check_constraints_exist():
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT conname
            FROM pg_constraint
            WHERE contype = 'c'
              AND conrelid IN (
                  'job_postings'::regclass,
                  'job_posting_skills'::regclass,
                  'applications'::regclass,
                  'placements'::regclass
              )
        """))
        check_names = {row[0] for row in result}

    # Only applications, job_posting_skills, placements had checks defined in the code I just wrote
    # job_postings doesn't have a status CHECK constraint in the models I just wrote? Let's verify.
    # Ah, I added default="open" but no check constraint. The documentation didn't explicitly demand a specific ENUM for job_posting status, but I will check if the check constraints that ARE defined exist.
    expected = {
        "ck_job_posting_skills_importance",
        "ck_applications_status",
        "ck_placements_outcome_status",
    }
    missing = expected - check_names
    assert not missing, f"Missing check constraints: {missing}"


def test_employers_fks():
    inspector = inspect(engine)
    fks = inspector.get_foreign_keys("employers", schema="public")
    referred = {fk["referred_table"] for fk in fks}
    assert "users" in referred


def test_job_postings_fks():
    inspector = inspect(engine)
    fks = inspector.get_foreign_keys("job_postings", schema="public")
    referred = {fk["referred_table"] for fk in fks}
    assert "job_roles" in referred
    assert "employers" in referred


def test_job_posting_skills_fks():
    inspector = inspect(engine)
    fks = inspector.get_foreign_keys("job_posting_skills", schema="public")
    referred = {fk["referred_table"] for fk in fks}
    assert "job_postings" in referred
    assert "skills" in referred


def test_applications_fks():
    inspector = inspect(engine)
    fks = inspector.get_foreign_keys("applications", schema="public")
    referred = {fk["referred_table"] for fk in fks}
    assert "candidate_profiles" in referred
    assert "job_postings" in referred


def test_placements_fks():
    inspector = inspect(engine)
    fks = inspector.get_foreign_keys("placements", schema="public")
    referred = {fk["referred_table"] for fk in fks}
    assert "candidate_profiles" in referred
    assert "employers" in referred
    assert "job_roles" in referred
    assert "job_postings" in referred
    assert "applications" in referred
    assert "course_enrollments" in referred

