"""
Phase 6.11 verified dataset ingestion service.

Loads PDF/CVS datasets into raw staging tables, validates them,
and prepares mapped staging records without promoting to canonical.
"""
from __future__ import annotations

import csv
import hashlib
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import pdfplumber
from sqlalchemy import insert
from sqlalchemy.orm import Session

from app.models.demand import DataSource
from app.models.phase6 import DataIngestionRun
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
)


def compute_sha256(file_path: Path) -> str:
    with open(file_path, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


class VerifiedDatasetIngestion:
    """Ingest verified additional datasets into staging."""

    def __init__(self, session: Session, data_source_id: uuid.UUID | None = None):
        self.session = session
        self.data_source_id = data_source_id

    def ingest_csv_dataset(
        self,
        csv_path: Path,
        dataset_label: str,
        artifact_metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        sha256 = compute_sha256(csv_path)
        artifact = self._create_source_artifact(csv_path, sha256, dataset_label, artifact_metadata or {}, artifact_type="csv")
        run_id = self._create_ingestion_run(artifact.id, dataset_label) # Get the run_id
        rows = self._extract_csv_rows(csv_path, dataset_label)
        raw_courses, raw_providers, raw_skills, raw_job_roles = self._load_raw_records(run_id, artifact.id, rows, dataset_label) # Pass run_id
        staged = self._create_staging_records(raw_courses, raw_providers, raw_skills, raw_job_roles, run_id)
        return {
            "dataset_label": dataset_label,
            "source_artifact_id": str(artifact.id),
            "ingestion_run_id": str(run_id), # Use the run_id
            "sha256": sha256,
            "rows_extracted": len(rows),
            "raw_courses": len(raw_courses),
            "raw_providers": len(raw_providers),
            "raw_skills": len(raw_skills),
            "raw_job_roles": len(raw_job_roles),
            "staged_courses": len(staged["courses"]),
            "staged_providers": len(staged["providers"]),
            "staged_skills": len(staged["skills"]),
            "staged_job_roles": len(staged["job_roles"]),
        }

    def ingest_pdf_dataset(
        self,
        pdf_path: Path,
        dataset_label: str,
        artifact_metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        sha256 = compute_sha256(pdf_path)
        artifact = self._create_source_artifact(pdf_path, sha256, dataset_label, artifact_metadata or {}, artifact_type="pdf")
        self.session.flush()
        existing_raw_count = self.session.query(RawStagingCourse).filter_by(source_artifact_id=artifact.id).count()
        if existing_raw_count > 0:
            return {
                "dataset_label": dataset_label,
                "source_artifact_id": str(artifact.id),
                "ingestion_run_id": None,
                "sha256": sha256,
                "rows_extracted": existing_raw_count,
                "raw_courses": existing_raw_count,
                "raw_providers": existing_raw_count,
                "raw_skills": existing_raw_count,
                "raw_job_roles": existing_raw_count,
                "staged_courses": 0,
                "staged_providers": 0,
                "staged_skills": 0,
                "staged_job_roles": 0,
            }
        ingestion_run = self._create_ingestion_run(artifact.id, dataset_label)
        rows = self._extract_pdf_rows(pdf_path, dataset_label)
        raw_courses, raw_providers, raw_skills, raw_job_roles = self._load_raw_records(ingestion_run.id, artifact.id, rows, dataset_label)
        staged = self._create_staging_records(raw_courses, raw_providers, raw_skills, raw_job_roles, ingestion_run.id, ingestion_run.source_id)
        return {
            "dataset_label": dataset_label,
            "source_artifact_id": str(artifact.id),
            "ingestion_run_id": str(ingestion_run.id),
            "sha256": sha256,
            "rows_extracted": len(rows),
            "raw_courses": len(raw_courses),
            "raw_providers": len(raw_providers),
            "raw_skills": len(raw_skills),
            "raw_job_roles": len(raw_job_roles),
            "staged_courses": len(staged["courses"]),
            "staged_providers": len(staged["providers"]),
            "staged_skills": len(staged["skills"]),
            "staged_job_roles": len(staged["job_roles"]),
        }

    def _create_source_artifact(self, pdf_path: Path, sha256: str, dataset_label: str, metadata: dict, artifact_type: str = "pdf") -> SourceArtifact:
        existing = self.session.query(SourceArtifact).filter_by(filename=pdf_path.name, sha256=sha256).first()
        if existing:
            return existing
        artifact = SourceArtifact(
            artifact_type=artifact_type,
            filename=pdf_path.name,
            file_size_bytes=pdf_path.stat().st_size,
            sha256=sha256,
            mime_type="application/csv" if artifact_type == "csv" else "application/pdf",
            retrieved_at=now_utc(),
            retrieved_by="phase6_11_automated",
            source_url=metadata.get("source_url"),
            retrieval_method=metadata.get("retrieval_method", "file_system"),
            access_context=metadata.get("access_context", "verified_project_dataset"),
            license=metadata.get("license"),
            version=metadata.get("version"),
            fiscal_year=metadata.get("fiscal_year"),
            is_official=metadata.get("is_official", False),
            metadata_json=metadata,
        )
        self.session.add(artifact)
        try:
            self.session.flush()
        except Exception:
            self.session.rollback()
            existing = self.session.query(SourceArtifact).filter_by(filename=pdf_path.name, sha256=sha256).first()
            if existing:
                return existing
            raise
        return artifact

    def _create_ingestion_run(self, source_artifact_id: uuid.UUID, dataset_label: str) -> DataIngestionRun:
        data_source = DataSource(
            name=f"Staging dataset: {dataset_label}",
            source_category="staging",
            description=f"Verified dataset for Phase 6.11 staging: {dataset_label}",
            source_url=None,
            organization="SkillMitra Phase 6.11",
            status="active",
        )
        self.session.add(data_source)
        self.session.flush()
        run = DataIngestionRun(
            source_id=data_source.id,
            started_at=now_utc(),
            completed_at=now_utc(),
            status="completed",
            records_received=0,
            records_accepted=0,
            records_rejected=0,
            records_deduplicated=0,
            error_summary=None,
        )
        self.session.add(run)
        self.session.flush()
        return run

    def _extract_csv_rows(self, csv_path: Path, dataset_label: str) -> list[dict[str, Any]]:
        rows = []
        with open(csv_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for idx, row in enumerate(reader, start=1):
                # Normalize keys to remove leading/trailing whitespace which might occur during CSV parsing
                normalized_row = {k.strip(): v for k, v in row.items()}
                normalized_row["_dataset_label"] = dataset_label
                normalized_row["_source_file"] = csv_path.name
                normalized_row["_row_number"] = idx
                rows.append(normalized_row)
        return rows

    def _extract_pdf_rows(self, pdf_path: Path, dataset_label: str) -> list[dict[str, Any]]:
        rows = []
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                tables = page.extract_tables()
                for table in tables:
                    if not table:
                        continue
                    headers = [str(h).strip().replace("\n", " ") if h else "" for h in table[0]]
                    for idx, row in enumerate(table[1:], start=1):
                        if not row or all(cell is None or str(cell).strip() == "" for cell in row):
                            continue
                        data = {"_dataset_label": dataset_label, "_source_file": pdf_path.name, "_row_number": idx}
                        for h, cell in zip(headers, row):
                            data[h] = str(cell).replace("\n", " ") if cell is not None else None
                        rows.append(data)
        return rows

    def _load_raw_records(self, run_id: uuid.UUID, artifact_id: uuid.UUID, rows: list[dict], dataset_label: str):
        raw_courses = []
        raw_providers = []
        raw_skills = []
        raw_job_roles = []
        for idx, row in enumerate(rows, start=1):
            raw_course = RawStagingCourse(
                ingestion_run_id=run_id,
                source_artifact_id=artifact_id,
                row_number=idx,
                raw_data=row,
                source_course_code=row.get("Course ID") or row.get("Course_ID") or row.get("Course Code"),
                source_version=None,  # As per Phase 6.8 findings
                validation_status="pending",
                validation_errors=None,
                dataset_label=dataset_label,
            )
            raw_provider = RawStagingProvider(
                ingestion_run_id=run_id,
                source_artifact_id=artifact_id,
                row_number=idx,
                raw_data=row,
                source_provider_id=None,
                validation_status="pending",
                validation_errors=None,
                dataset_label=dataset_label,
            )
            raw_skill = RawStagingSkill(
                ingestion_run_id=run_id,
                source_artifact_id=artifact_id,
                row_number=idx,
                raw_data=row,
                validation_status="pending",
                validation_errors=None,
                dataset_label=dataset_label,
            )
            raw_job_role = RawStagingJobRole(
                ingestion_run_id=run_id,
                source_artifact_id=artifact_id,
                row_number=idx,
                raw_data=row,
                validation_status="pending",
                validation_errors=None,
                dataset_label=dataset_label,
            )
            self.session.add_all([raw_course, raw_provider, raw_skill, raw_job_role])
            raw_courses.append(raw_course)
            raw_providers.append(raw_provider)
            raw_skills.append(raw_skill)
            raw_job_roles.append(raw_job_role)
        self.session.flush()
        return raw_courses, raw_providers, raw_skills, raw_job_roles

    def _create_staging_records(self, raw_courses, raw_providers, raw_skills, raw_job_roles, run_id, data_source_id):
        staged_courses = []
        staged_providers = []
        staged_skills = []
        staged_job_roles = []
        for raw_course, raw_provider, raw_skill, raw_job_role in zip(raw_courses, raw_providers, raw_skills, raw_job_roles):
            course_data = raw_course.raw_data or {}
            provider_data = raw_provider.raw_data or {}
            skill_data = raw_skill.raw_data or {}
            role_data = raw_job_role.raw_data or {}

            staged_course = StagingCourse(
                raw_id=raw_course.id,
                source_course_code=course_data.get("Course ID"),
                source_version=None,
                title=course_data.get("Course Name"),
                qualification=course_data.get("Eligibility"),
                duration_hours=self._parse_duration(course_data.get("Duration_Months") or course_data.get("Duration")),  # Match CSV/PDF headers
                dataset_label=raw_course.dataset_label,
                data_source_id=data_source_id,
                ingestion_run_id=run_id,
                mapping_status="BLOCKED",
                validation_status="pending",
                review_status="pending",
            )
            staged_provider = StagingProvider(
                raw_id=raw_provider.id,
                name=provider_data.get("Training Centre / Provider"),
                source_provider_id=None,
                dataset_label=raw_provider.dataset_label,
                data_source_id=data_source_id,
                mapping_status="BLOCKED",
                validation_status="pending",
                review_status="pending",
            )
            # Skills are comma-separated in "Skills" or "Skills_Modules" column
            skill_names_str = skill_data.get("Skills") or skill_data.get("Skills_Modules") or skill_data.get("Skills Modules")
            skill_names = [s.strip() for s in skill_names_str.split(",") if s.strip()] if skill_names_str else []
            staged_skills_list = []
            for skill_name in skill_names:
                staged_skill = StagingSkill(
                    raw_id=raw_skill.id,
                    source_skill_name=skill_name,
                    mapping_status="REVIEW_REQUIRED",  # As per Phase 6.8 findings for skills
                    dataset_label=raw_skill.dataset_label,
                    review_status="pending",
                )
                staged_skills_list.append(staged_skill)

            staged_role = StagingJobRole(
                raw_id=raw_job_role.id,
                source_role_name=role_data.get("Job_Role") or role_data.get("Job Role"),  # Match CSV/PDF headers
                mapping_status="REVIEW_REQUIRED",
                dataset_label=raw_job_role.dataset_label,
                review_status="pending",
            )
            self.session.add_all([staged_course, staged_provider, staged_role] + staged_skills_list)
            staged_courses.append(staged_course)
            staged_providers.append(staged_provider)
            staged_skills.extend(staged_skills_list)
            staged_job_roles.append(staged_role)
        self.session.flush()
        return {
            "courses": staged_courses,
            "providers": staged_providers,
            "skills": staged_skills,
            "job_roles": staged_job_roles,
        }

    def _parse_duration(self, duration_text: str | None) -> int | None:
        if not duration_text:
            return None
        import re
        m = re.search(r"(\d+)", duration_text.replace(",", ""))
        if m:
            return int(m.group(1))
        return None
