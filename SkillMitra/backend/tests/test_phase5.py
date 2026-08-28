"""Phase 5 analytics authorization and formula smoke tests."""
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_demand_evidence_requires_government_role():
    assert client.get("/api/v1/government/demand-evidence").status_code == 401


def test_training_supply_by_skill_requires_government_role():
    assert client.get("/api/v1/government/training-supply-by-skill").status_code == 401


def test_training_gaps_requires_government_role():
    assert client.get("/api/v1/government/training-gaps", params={"district_id": "00000000-0000-0000-0000-000000000000"}).status_code == 401


def test_course_alignment_requires_government_role():
    assert client.get("/api/v1/government/course-alignment/00000000-0000-0000-0000-000000000000").status_code == 401


def test_placement_outcomes_requires_government_role():
    assert client.get("/api/v1/government/placement-outcomes").status_code == 401


def test_trainer_gaps_requires_government_role():
    path = "/api/v1/government/trainer-gaps/00000000-0000-0000-0000-000000000000/00000000-0000-0000-0000-000000000000"
    assert client.get(path).status_code == 401


def test_equipment_gaps_requires_government_role():
    path = "/api/v1/government/equipment-gaps/00000000-0000-0000-0000-000000000000/00000000-0000-0000-0000-000000000000"
    assert client.get(path).status_code == 401


def test_phase5_routes_are_in_openapi():
    paths = set(app.openapi()["paths"])
    assert "/api/v1/government/demand-evidence" in paths
    assert "/api/v1/government/training-gaps" in paths
    assert "/api/v1/government/course-alignment/{course_id}" in paths
    assert "/api/v1/government/placement-outcomes" in paths
    assert "/api/v1/government/district-plans/generate" in paths
