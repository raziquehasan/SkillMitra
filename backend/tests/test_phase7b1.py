from unittest.mock import patch
import pytest
from sqlalchemy import inspect
from app.core.database import engine
from app.models.career import Course


def test_course_model_has_expected_attributes():
    # Test the existence of new attributes added in phase 7b1
    course_attrs = [attr.key for attr in Course.__table__.columns]
    expected_attrs = [
        "source_course_code", "qualification", "cost_category",
        "rate_per_hour", "nsqf_level", "nqr_code", "source_version",
        "industry_sector_id", "data_source_id", "ingestion_run_id",
        "source_record_identifier", "source_updated_at"
    ]
    for attr in expected_attrs:
        assert attr in course_attrs


def test_course_master_source_identity_constraints_exist():
    unique_names = {constraint["name"] for constraint in inspect(engine).get_unique_constraints("courses")}
    # Check for the new constraint name as per Phase 6.4 schema update
    assert "uq_courses_source_identity" in unique_names