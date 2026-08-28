"""Phase 6 evidence-layer schema and security tests."""
from fastapi.testclient import TestClient
from sqlalchemy import inspect
from app.core.database import engine
from app.main import app

client = TestClient(app)

PHASE_6_TABLES = {
    "data_ingestion_runs",
    "raw_job_postings",
    "ingestion_rejected_records",
    "job_role_aliases",
    "industry_consultations",
    "employer_curriculum_validations",
}


def test_phase6_tables_exist_in_supabase():
    existing = set(inspect(engine).get_table_names(schema="public"))
    assert PHASE_6_TABLES <= existing


def test_sources_requires_government_authentication():
    assert client.get("/api/v1/ingestion/sources").status_code == 401


def test_job_ingestion_requires_government_authentication():
    assert client.post("/api/v1/ingestion/job-postings", json={"source_id": "00000000-0000-0000-0000-000000000000", "records": []}).status_code == 401


def test_ingestion_runs_require_government_authentication():
    assert client.get("/api/v1/ingestion/runs").status_code == 401


def test_skill_normalization_requires_government_authentication():
    assert client.get("/api/v1/ingestion/normalize/skills/JavaScript").status_code == 401


def test_role_normalization_requires_government_authentication():
    assert client.get("/api/v1/ingestion/normalize/roles/Developer").status_code == 401


def test_freshness_requires_government_authentication():
    assert client.get("/api/v1/government/data-freshness").status_code == 401


def test_consultation_requires_employer_authentication():
    assert client.post("/api/v1/employer/consultations", json={}).status_code == 401


def test_curriculum_validation_requires_employer_authentication():
    assert client.post("/api/v1/employer/curriculum-validations", json={}).status_code == 401


def test_government_validation_requires_government_authentication():
    assert client.get("/api/v1/government/employer-validation").status_code == 401


def test_phase6_routes_are_in_openapi():
    paths = set(app.openapi()["paths"])
    assert "/api/v1/ingestion/sources" in paths
    assert "/api/v1/ingestion/job-postings" in paths
    assert "/api/v1/government/data-freshness" in paths
    assert "/api/v1/employer/curriculum-validations" in paths
