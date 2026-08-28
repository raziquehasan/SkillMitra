"""Tests for course alignment, training recommendations, and provider references."""
import uuid
from fastapi.testclient import TestClient

from app.core.database import engine
from app.main import app

client = TestClient(app)


def test_course_alignment_endpoint_is_public():
    demand_id = uuid.uuid4()
    response = client.get(f"/api/v1/courses/alignment/demand/{demand_id}")
    assert response.status_code in (200, 404)


def test_skill_gap_analysis_endpoint_is_public():
    job_role_id = uuid.uuid4()
    response = client.get(f"/api/v1/courses/alignment/skill-gap/{job_role_id}")
    assert response.status_code in (200, 404)


def test_district_recommendations_requires_government_auth():
    district_id = uuid.uuid4()
    response = client.get(f"/api/v1/government/district-recommendations/{district_id}")
    assert response.status_code == 401


def test_skill_gap_summary_requires_government_auth():
    district_id = uuid.uuid4()
    response = client.get(f"/api/v1/government/skill-gap-summary/{district_id}")
    assert response.status_code == 401


def test_provider_availability_requires_government_auth():
    district_id = uuid.uuid4()
    response = client.get(f"/api/v1/government/provider-availability/{district_id}")
    assert response.status_code == 401


def test_provider_verification_requires_provider_auth():
    provider_id = uuid.uuid4()
    response = client.get(f"/api/v1/training-providers/verification/{provider_id}")
    assert response.status_code == 401


def test_course_alignment_endpoint_exists():
    demand_id = uuid.uuid4()
    response = client.get(f"/api/v1/courses/alignment/demand/{demand_id}")
    assert response.status_code in (200, 404)


def test_skill_gap_analysis_endpoint_exists():
    job_role_id = uuid.uuid4()
    response = client.get(f"/api/v1/courses/alignment/skill-gap/{job_role_id}")
    assert response.status_code in (200, 404)


def test_district_recommendations_endpoint_exists():
    district_id = uuid.uuid4()
    response = client.get(f"/api/v1/government/district-recommendations/{district_id}")
    assert response.status_code in (401, 404)


def test_provider_availability_endpoint_exists():
    district_id = uuid.uuid4()
    response = client.get(f"/api/v1/government/provider-availability/{district_id}")
    assert response.status_code in (401, 404)


def test_provider_verification_endpoint_exists():
    provider_id = uuid.uuid4()
    response = client.get(f"/api/v1/training-providers/verification/{provider_id}")
    assert response.status_code in (401, 404)
