"""Phase 7B-1 course metadata schema verification."""
from sqlalchemy import inspect

from app.core.database import engine


EXPECTED_COLUMNS = {
    "source_course_code",
    "qualification",
    "cost_category",
    "rate_per_hour",
    "nsqf_level",
    "nqr_code",
    "source_version",
    "industry_sector_id",
    "data_source_id",
    "ingestion_run_id",
    "source_record_identifier",
    "source_updated_at",
}


def test_course_master_columns_exist_and_are_nullable():
    columns = {column["name"]: column for column in inspect(engine).get_columns("courses")}
    assert EXPECTED_COLUMNS <= columns.keys()
    assert all(columns[name]["nullable"] for name in EXPECTED_COLUMNS)


def test_course_master_numeric_types_are_preserved():
    columns = {column["name"]: column for column in inspect(engine).get_columns("courses")}
    assert str(columns["rate_per_hour"]["type"]) == "NUMERIC(10, 2)"
    assert "INTEGER" in str(columns["nsqf_level"]["type"])
    assert "INTEGER" in str(columns["duration_hours"]["type"])


def test_course_master_provenance_foreign_keys_exist():
    foreign_keys = inspect(engine).get_foreign_keys("courses")
    targets = {foreign_key["referred_table"] for foreign_key in foreign_keys}
    assert {"industry_sectors", "data_sources", "data_ingestion_runs"} <= targets


def test_course_master_source_identity_constraints_exist():
    unique_names = {constraint["name"] for constraint in inspect(engine).get_unique_constraints("courses")}
    assert "uq_courses_source_course_code" in unique_names
    assert "uq_courses_source_nqr_version" in unique_names


def test_course_master_source_indexes_exist():
    index_names = {index["name"] for index in inspect(engine).get_indexes("courses")}
    assert {"ix_courses_source_course_code", "ix_courses_data_source_id", "ix_courses_ingestion_run_id"} <= index_names


def test_course_master_numeric_checks_exist():
    constraints = inspect(engine).get_check_constraints("courses")
    names = {constraint["name"] for constraint in constraints}
    assert {"ck_courses_nsqf_level_nonnegative", "ck_courses_rate_nonnegative"} <= names
