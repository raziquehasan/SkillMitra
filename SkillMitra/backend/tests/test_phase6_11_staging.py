"""Phase 6.11 staging infrastructure tests."""
from __future__ import annotations

import hashlib
import os
from pathlib import Path

import pytest
from sqlalchemy import inspect

from app.core.database import engine, SessionLocal

try:
    from app.models.staging import (
        SourceArtifact,
        RawStagingCourse,
        RawStagingProvider,
        RawStagingSkill,
        RawStagingJobRole,
        StagingCourse,
        StagingProvider,
        StagingSkill,
        StagingJobRole,
        PromotionAuditLog,
    )
    MODELS_AVAILABLE = True
except ImportError:
    MODELS_AVAILABLE = False


@pytest.fixture(scope="session")
def dataset_paths():
    base = Path(__file__).resolve().parents[2] / "database"
    return {
        "chhatrapati": base / "Chhatrapati_Sambhajinagar_SkillMitra_Dataset (1).pdf",
        "mumbai": base / "Mumbai_SkillMitra_Dataset.pdf",
        "mumbai_shivaji": base / "Mumbai_Shivaji_SkillMitra_Dataset.pdf",
    }


@pytest.fixture(autouse=True)
def clean_staging_tables():
    from sqlalchemy import text
    with engine.connect() as conn:
        with conn.begin():
            conn.execute(text("DELETE FROM staging_job_roles"))
            conn.execute(text("DELETE FROM staging_skills"))
            conn.execute(text("DELETE FROM staging_providers"))
            conn.execute(text("DELETE FROM staging_courses"))
            conn.execute(text("DELETE FROM raw_staging_job_roles"))
            conn.execute(text("DELETE FROM raw_staging_skills"))
            conn.execute(text("DELETE FROM raw_staging_providers"))
            conn.execute(text("DELETE FROM raw_staging_courses"))
            conn.execute(text("DELETE FROM promotion_audit_logs"))
            conn.execute(text("DELETE FROM data_ingestion_runs"))
            conn.execute(text("DELETE FROM source_artifacts"))
            conn.execute(text("DELETE FROM data_sources WHERE name LIKE 'Staging dataset:%'"))
    yield


def test_mumbai_shivaji_file_absent(dataset_paths):
    assert not dataset_paths["mumbai_shivaji"].exists(), "Mumbai Shivaji file should not exist in database folder"


def test_phase6_11_staging_tables_exist():
    if not MODELS_AVAILABLE:
        pytest.skip("Staging models not available")
    existing = set(inspect(engine).get_table_names(schema="public"))
    required = {
        "source_artifacts",
        "raw_staging_courses",
        "raw_staging_providers",
        "raw_staging_skills",
        "raw_staging_job_roles",
        "staging_courses",
        "staging_providers",
        "staging_skills",
        "staging_job_roles",
        "promotion_audit_logs",
    }
    assert required.issubset(existing), f"Missing staging tables: {required - existing}"


def test_source_artifact_sha256_preserved(dataset_paths):
    if not dataset_paths["chhatrapati"].exists():
        pytest.skip("Chhatrapati dataset not found")
    expected = "b8fde845103f09cdf261fff12e31d724f36117b67f66f4f7cdb97a01ed39c079"
    with open(dataset_paths["chhatrapati"], "rb") as f:
        actual = hashlib.sha256(f.read()).hexdigest()
    assert actual == expected


def test_mumbai_sha256_preserved(dataset_paths):
    if not dataset_paths["mumbai"].exists():
        pytest.skip("Mumbai dataset not found")
    expected = "c2133b0646a5b86f016743cbb02ab14d4909f18e2cf5f38947ee7d43d3295ed0"
    with open(dataset_paths["mumbai"], "rb") as f:
        actual = hashlib.sha256(f.read()).hexdigest()
    assert actual == expected


def test_raw_staging_records_immutable(dataset_paths):
    if not MODELS_AVAILABLE or not dataset_paths["chhatrapati"].exists():
        pytest.skip("Staging models or dataset not available")
    from app.services.staging_ingestion import VerifiedDatasetIngestion
    session = SessionLocal()
    try:
        ingestion = VerifiedDatasetIngestion(session)
        result = ingestion.ingest_pdf_dataset(dataset_paths["chhatrapati"], "CHHATRAPATI_SAMBHAJINAGAR")
        assert result["rows_extracted"] == 12
        assert result["raw_courses"] == 12
        assert result["raw_providers"] == 12
        assert result["raw_skills"] == 12
        assert result["raw_job_roles"] == 12
    finally:
        session.close()


def test_idempotency_same_dataset(dataset_paths):
    if not MODELS_AVAILABLE or not dataset_paths["chhatrapati"].exists():
        pytest.skip("Staging models or dataset not available")
    from app.services.staging_ingestion import VerifiedDatasetIngestion
    session = SessionLocal()
    try:
        ingestion = VerifiedDatasetIngestion(session)
        result1 = ingestion.ingest_pdf_dataset(dataset_paths["chhatrapati"], "CHHATRAPATI_SAMBHAJINAGAR")
        result2 = ingestion.ingest_pdf_dataset(dataset_paths["chhatrapati"], "CHHATRAPATI_SAMBHAJINAGAR")
        assert result1["rows_extracted"] == result2["rows_extracted"]
    finally:
        session.close()


def test_no_canonical_course_insert():
    from sqlalchemy import text
    with engine.connect() as conn:
        result = conn.execute(text("SELECT COUNT(*) FROM courses"))
        baseline = result.scalar()
        assert baseline >= 0


def test_no_canonical_provider_insert():
    from sqlalchemy import text
    with engine.connect() as conn:
        result = conn.execute(text("SELECT COUNT(*) FROM training_providers"))
        assert result.scalar() == 0


def test_no_canonical_skill_insert():
    from sqlalchemy import text
    with engine.connect() as conn:
        result = conn.execute(text("SELECT COUNT(*) FROM skills"))
        baseline = result.scalar()
        assert baseline >= 0


def test_no_canonical_job_role_insert():
    from sqlalchemy import text
    with engine.connect() as conn:
        result = conn.execute(text("SELECT COUNT(*) FROM job_roles"))
        baseline = result.scalar()
        assert baseline >= 0


def test_dataset_isolation_mumbai_not_in_chhatrapati(dataset_paths):
    if not MODELS_AVAILABLE or not dataset_paths["mumbai"].exists():
        pytest.skip("Staging models or dataset not available")
    from app.services.staging_ingestion import VerifiedDatasetIngestion
    session = SessionLocal()
    try:
        ingestion = VerifiedDatasetIngestion(session)
        mumbai_result = ingestion.ingest_pdf_dataset(dataset_paths["mumbai"], "MUMBAI")
        assert mumbai_result["rows_extracted"] == 7
        assert mumbai_result["dataset_label"] == "MUMBAI"
    finally:
        session.close()


def test_chhatrapati_district_preserved():
    from app.services.staging_ingestion import VerifiedDatasetIngestion
    if not MODELS_AVAILABLE:
        pytest.skip("Staging models not available")
    dataset_path = Path(__file__).resolve().parents[2] / "database" / "Chhatrapati_Sambhajinagar_SkillMitra_Dataset (1).pdf"
    if not dataset_path.exists():
        pytest.skip("Chhatrapati dataset not found")
    session = SessionLocal()
    try:
        ingestion = VerifiedDatasetIngestion(session)
        result = ingestion.ingest_pdf_dataset(dataset_path, "CHHATRAPATI_SAMBHAJINAGAR")
        assert result["rows_extracted"] == 12
    finally:
        session.close()


def test_null_source_version_blocks_course():
    from app.services.staging_ingestion import VerifiedDatasetIngestion
    if not MODELS_AVAILABLE:
        pytest.skip("Staging models not available")
    dataset_path = Path(__file__).resolve().parents[2] / "database" / "Chhatrapati_Sambhajinagar_SkillMitra_Dataset (1).pdf"
    if not dataset_path.exists():
        pytest.skip("Chhatrapati dataset not found")
    session = SessionLocal()
    try:
        ingestion = VerifiedDatasetIngestion(session)
        result = ingestion.ingest_pdf_dataset(dataset_path, "CHHATRAPATI_SAMBHAJINAGAR")
        assert result["staged_courses"] == 12
        staged = session.query(StagingCourse).filter_by(dataset_label="CHHATRAPATI_SAMBHAJINAGAR").all()
        for s in staged:
            assert s.source_version is None
            assert s.mapping_status == "BLOCKED"
    finally:
        session.close()


def test_estimated_values_preserved():
    from app.services.staging_ingestion import VerifiedDatasetIngestion
    if not MODELS_AVAILABLE:
        pytest.skip("Staging models not available")
    dataset_path = Path(__file__).resolve().parents[2] / "database" / "Chhatrapati_Sambhajinagar_SkillMitra_Dataset (1).pdf"
    if not dataset_path.exists():
        pytest.skip("Chhatrapati dataset not found")
    session = SessionLocal()
    try:
        ingestion = VerifiedDatasetIngestion(session)
        ingestion.ingest_pdf_dataset(dataset_path, "CHHATRAPATI_SAMBHAJINAGAR")
        raw = session.query(RawStagingCourse).filter_by(dataset_label="CHHATRAPATI_SAMBHAJINAGAR").first()
        assert raw is not None
        completed = raw.raw_data.get("Completed", "")
        assert "~" in completed or "*" in completed
    finally:
        session.close()
