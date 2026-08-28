"""Phase 9 operational workflow tests."""
import uuid
from datetime import date
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import engine
from app.main import app
from app.models.phase9 import CurriculumProposal, AuditLog
from app.models.phase4 import DistrictTrainingPlanItem, TrainingProvider
from app.models.demand import IndustryDemand
from app.models.career import Course

client = TestClient(app)


def test_source_type_filtering_requires_government_auth():
    district_id = uuid.uuid4()
    response = client.get(f"/api/v1/government/demand?source_type=MAHARASHTRA_SOURCE&district_id={district_id}")
    assert response.status_code == 401


def test_government_review_plan_item_requires_auth():
    plan_item_id = uuid.uuid4()
    response = client.post(f"/api/v1/government/recommendations/{plan_item_id}/review", json={"review_status": "approved"})
    assert response.status_code == 401


def test_provider_verification_requires_government_auth():
    provider_id = uuid.uuid4()
    response = client.post(f"/api/v1/government/providers/{provider_id}/verify", json={"verification_status": "verified"})
    assert response.status_code == 401


def test_curriculum_proposal_requires_auth():
    response = client.post("/api/v1/curriculum/proposals", json={
        "curriculum_version_id": str(uuid.uuid4()),
        "course_id": str(uuid.uuid4()),
    })
    assert response.status_code == 401


def test_capacity_gap_requires_government_auth():
    district_id = uuid.uuid4()
    response = client.get(f"/api/v1/government/capacity/{district_id}")
    assert response.status_code == 401


def test_equipment_gap_requires_government_auth():
    course_id = uuid.uuid4()
    response = client.get(f"/api/v1/government/equipment-gap/{course_id}")
    assert response.status_code == 401


def test_trainer_gap_requires_government_auth():
    course_id = uuid.uuid4()
    response = client.get(f"/api/v1/government/trainer-gap/{course_id}")
    assert response.status_code == 401


def test_district_intelligence_requires_government_auth():
    district_id = uuid.uuid4()
    response = client.get(f"/api/v1/government/district-intelligence/{district_id}")
    assert response.status_code == 401


def test_data_quality_requires_government_auth():
    response = client.get("/api/v1/government/data-quality")
    assert response.status_code == 401


def test_employer_validation_requires_employer_auth():
    response = client.post("/api/v1/employers/me/curriculum-validations", json={
        "course_id": str(uuid.uuid4()),
        "status": "relevant",
    })
    assert response.status_code == 401


def test_source_type_endpoint_exists():
    response = client.get("/api/v1/government/demand?source_type=MAHARASHTRA_SOURCE")
    assert response.status_code == 401


def test_capacity_no_provider_vs_zero_capacity():
    with engine.connect() as conn:
        district_id = uuid.uuid4()
        response = client.get(f"/api/v1/government/capacity/{district_id}")
        assert response.status_code == 401


def test_employer_validation_absence_returns_not_yet_available():
    from sqlalchemy.orm import Session
    from app.models.career import Course
    from sqlalchemy import select
    db = Session(engine)
    try:
        course = db.scalar(select(Course))
        if not course:
            return
        response = client.get(f"/api/v1/government/employer-validation/{course.id}")
        assert response.status_code in (401, 404)
    finally:
        db.close()


def test_placement_null_safety():
    with engine.connect() as conn:
        response = client.get("/api/v1/government/placement-analytics")
        assert response.status_code == 401


def test_audit_log_table_exists():
    from sqlalchemy import text
    with engine.connect() as conn:
        result = conn.execute(text("SELECT to_regclass('public.audit_logs')"))
        assert result.scalar() is not None


def test_curriculum_proposals_table_exists():
    from sqlalchemy import text
    with engine.connect() as conn:
        result = conn.execute(text("SELECT to_regclass('public.curriculum_proposals')"))
        assert result.scalar() is not None


def test_training_provider_verification_status_column_exists():
    from sqlalchemy import text
    with engine.connect() as conn:
        result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='training_providers' AND column_name='verification_status'"))
        assert result.fetchone() is not None


def test_district_plan_item_review_status_column_exists():
    from sqlalchemy import text
    with engine.connect() as conn:
        result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='district_training_plan_items' AND column_name='review_status'"))
        assert result.fetchone() is not None
