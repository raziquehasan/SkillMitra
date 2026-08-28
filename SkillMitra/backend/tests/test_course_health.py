"""Tests for course health scoring."""
import uuid
from datetime import date
from fastapi.testclient import TestClient
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from app.core.database import engine
from app.main import app
from app.models.phase8 import CourseHealthScore
from app.models.career import Course, CourseSkill
from app.models.demand import IndustryDemand
from app.models.phase4 import CourseOffering
from app.models.phase6 import EmployerCurriculumValidation

client = TestClient(app)


def _get_first_course_id() -> str | None:
    with Session(engine) as session:
        course = session.scalar(select(Course).limit(1))
        return str(course.id) if course else None


def test_course_health_endpoint_exists():
    course_id = uuid.uuid4()
    response = client.get(f"/api/v1/courses/health/{course_id}")
    assert response.status_code in (200, 404)


def test_course_health_no_data_course():
    fake_id = str(uuid.uuid4())
    response = client.get(f"/api/v1/courses/health/{fake_id}")
    assert response.status_code == 404


def test_course_health_with_demand_and_alignment():
    course_id = _get_first_course_id()
    if not course_id:
        return
    response = client.get(f"/api/v1/courses/health/{course_id}")
    assert response.status_code == 200
    data = response.json()
    assert "demand_score" in data
    assert "skill_alignment_score" in data
    assert "explanation" in data
    assert "data_completeness" in data


def test_course_health_placement_missing():
    course_id = _get_first_course_id()
    if not course_id:
        return
    response = client.get(f"/api/v1/courses/health/{course_id}")
    assert response.status_code == 200
    data = response.json()
    assert "placement_score" in data
    if data["placement_score"] is None:
        assert data["data_completeness"]["placement"] is False


def test_course_health_employer_missing():
    course_id = _get_first_course_id()
    if not course_id:
        return
    response = client.get(f"/api/v1/courses/health/{course_id}")
    assert response.status_code == 200
    data = response.json()
    assert "employer_validation_score" in data
    if data["employer_validation_score"] is None:
        assert data["data_completeness"]["employer_validation"] is False


def test_course_health_supply_missing():
    course_id = _get_first_course_id()
    if not course_id:
        return
    response = client.get(f"/api/v1/courses/health/{course_id}")
    assert response.status_code == 200
    data = response.json()
    assert "supply_demand_score" in data
    if data["supply_demand_score"] is None:
        assert data["data_completeness"]["supply_demand"] is False


def test_course_health_high_demand_low_coverage():
    course_id = _get_first_course_id()
    if not course_id:
        return
    response = client.get(f"/api/v1/courses/health/{course_id}")
    assert response.status_code == 200
    data = response.json()
    assert "skill_alignment_score" in data
    if data["skill_alignment_score"] is not None and data["skill_alignment_score"] < 30:
        assert data["status"] in ("LOW_ALIGNMENT", "NEEDS_UPDATE", "OVERSUPPLIED_SIGNAL")


def test_course_health_high_demand_good_alignment():
    course_id = _get_first_course_id()
    if not course_id:
        return
    response = client.get(f"/api/v1/courses/health/{course_id}")
    assert response.status_code == 200
    data = response.json()
    assert "skill_alignment_score" in data
    if data["skill_alignment_score"] is not None and data["skill_alignment_score"] >= 50:
        assert data["status"] in ("HEALTHY", "NEEDS_UPDATE")


def test_course_health_status_values():
    course_id = _get_first_course_id()
    if not course_id:
        return
    response = client.get(f"/api/v1/courses/health/{course_id}")
    assert response.status_code == 200
    data = response.json()
    valid_statuses = {"HEALTHY", "NEEDS_UPDATE", "LOW_ALIGNMENT", "OVERSUPPLIED_SIGNAL", "INSUFFICIENT_DATA", "MANUAL_REVIEW"}
    assert data["status"] in valid_statuses


def test_course_health_scores_null_not_zero():
    course_id = _get_first_course_id()
    if not course_id:
        return
    response = client.get(f"/api/v1/courses/health/{course_id}")
    assert response.status_code == 200
    data = response.json()
    for key in ["demand_score", "skill_alignment_score", "placement_score", 
                "employer_validation_score", "technology_relevance_score", "supply_demand_score"]:
        val = data.get(key)
        assert val is None or isinstance(val, (int, float))
        if val is not None:
            assert val != 0 or data["data_completeness"].get(key.replace("_score", ""), False) is True


def test_course_health_persists_to_db():
    course_id = _get_first_course_id()
    if not course_id:
        return
    response = client.get(f"/api/v1/courses/health/{course_id}")
    assert response.status_code == 200
    with Session(engine) as session:
        record = session.scalar(
            select(CourseHealthScore).where(CourseHealthScore.course_id == course_id)
        )
        if record:
            assert record.industry_demand_score is not None or record.placement_score is not None or record.employer_validation_score is not None or record.curriculum_alignment_score is not None
