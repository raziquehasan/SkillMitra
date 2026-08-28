"""Phase 4 schema and authorization smoke tests."""
from fastapi.testclient import TestClient
from sqlalchemy import inspect

from app.core.database import engine
from app.main import app

client = TestClient(app)

PHASE_4_TABLES = {
    "candidate_skills",
    "curricula",
    "curriculum_versions",
    "curriculum_skills",
    "training_providers",
    "course_offerings",
    "trainers",
    "trainer_skills",
    "equipment",
    "course_equipment_requirements",
    "district_training_plans",
    "district_training_plan_items",
}


def test_phase4_tables_exist_in_supabase():
    existing = set(inspect(engine).get_table_names(schema="public"))
    assert PHASE_4_TABLES <= existing


def test_candidate_skills_requires_authentication():
    assert client.get("/api/v1/candidates/me/skills").status_code == 401


def test_provider_profile_requires_authentication():
    assert client.get("/api/v1/training-providers/me").status_code == 401


def test_provider_offerings_requires_authentication():
    assert client.get("/api/v1/training-providers/me/offerings").status_code == 401


def test_provider_trainers_requires_authentication():
    assert client.get("/api/v1/training-providers/me/trainers").status_code == 401


def test_provider_equipment_requires_authentication():
    assert client.get("/api/v1/training-providers/me/equipment").status_code == 401


def test_government_training_supply_requires_authentication():
    assert client.get("/api/v1/government/training-supply").status_code == 401


def test_phase4_routes_are_documented():
    paths = set(app.openapi()["paths"])
    assert "/api/v1/candidates/me/skills" in paths
    assert "/api/v1/training-providers/me/offerings" in paths
    assert "/api/v1/courses/{course_id}/curricula" in paths
    assert "/api/v1/government/training-supply" in paths
