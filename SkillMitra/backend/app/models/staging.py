"""
Phase 6.11 staging models for verified additional datasets.

Staging workflow: RAW -> VALIDATED -> MAPPED -> REVIEWED -> CANONICAL

Raw tables store immutable source data with full provenance.
Staging tables hold validated/mapped records ready for promotion.
Canonical promotion is handled in a separate phase.

External provider identity is separate from SkillMitra user identity.
training_providers.user_id remains NOT NULL + UNIQUE in canonical schema.
"""

import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
    UniqueConstraint,
    Index,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, utcnow


class SourceArtifact(TimestampMixin, Base):
    """Immutable source artifact record."""
    __tablename__ = "source_artifacts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    artifact_type: Mapped[str] = mapped_column(String(50), nullable=False)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_size_bytes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    sha256: Mapped[str | None] = mapped_column(String(64), nullable=True)
    mime_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    retrieved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    retrieved_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    source_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    retrieval_method: Mapped[str | None] = mapped_column(String(100), nullable=True)
    access_context: Mapped[str | None] = mapped_column(String(100), nullable=True)
    license: Mapped[str | None] = mapped_column(String(255), nullable=True)
    version: Mapped[str | None] = mapped_column(String(50), nullable=True)
    fiscal_year: Mapped[str | None] = mapped_column(String(20), nullable=True)
    is_official: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    metadata_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    __table_args__ = (
        UniqueConstraint("filename", "sha256", name="uq_source_artifact_filename_sha"),
        Index("ix_source_artifacts_sha256", "sha256"),
    )


class RawStagingCourse(TimestampMixin, Base):
    """Immutable raw course record from source artifact."""
    __tablename__ = "raw_staging_courses"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ingestion_run_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("data_ingestion_runs.id", ondelete="CASCADE"), nullable=False)
    source_artifact_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("source_artifacts.id", ondelete="CASCADE"), nullable=False)
    row_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    raw_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    source_course_code: Mapped[str | None] = mapped_column(String(100), nullable=True)
    source_version: Mapped[str | None] = mapped_column(String(50), nullable=True)
    validation_status: Mapped[str | None] = mapped_column(String(30), nullable=True)
    validation_errors: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    dataset_label: Mapped[str | None] = mapped_column(String(50), nullable=True)

    __table_args__ = (
        UniqueConstraint("source_artifact_id", "row_number", name="uq_raw_staging_course_artifact_row"),
        CheckConstraint("validation_status IS NULL OR validation_status IN ('pending', 'passed', 'failed', 'blocked')", name="ck_raw_staging_course_validation_status"),
        Index("ix_raw_staging_courses_artifact_id", "source_artifact_id"),
        Index("ix_raw_staging_courses_validation_status", "validation_status"),
    )


class RawStagingProvider(TimestampMixin, Base):
    """Immutable raw provider record from source artifact."""
    __tablename__ = "raw_staging_providers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ingestion_run_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("data_ingestion_runs.id", ondelete="CASCADE"), nullable=False)
    source_artifact_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("source_artifacts.id", ondelete="CASCADE"), nullable=False)
    row_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    raw_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    source_provider_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    validation_status: Mapped[str | None] = mapped_column(String(30), nullable=True)
    validation_errors: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    dataset_label: Mapped[str | None] = mapped_column(String(50), nullable=True)

    __table_args__ = (
        UniqueConstraint("source_artifact_id", "row_number", name="uq_raw_staging_provider_artifact_row"),
        CheckConstraint("validation_status IS NULL OR validation_status IN ('pending', 'passed', 'failed', 'blocked')", name="ck_raw_staging_provider_validation_status"),
        Index("ix_raw_staging_providers_artifact_id", "source_artifact_id"),
        Index("ix_raw_staging_providers_validation_status", "validation_status"),
    )


class RawStagingSkill(TimestampMixin, Base):
    """Immutable raw skill record from source artifact."""
    __tablename__ = "raw_staging_skills"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ingestion_run_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("data_ingestion_runs.id", ondelete="CASCADE"), nullable=False)
    source_artifact_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("source_artifacts.id", ondelete="CASCADE"), nullable=False)
    row_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    raw_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    validation_status: Mapped[str | None] = mapped_column(String(30), nullable=True)
    validation_errors: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    dataset_label: Mapped[str | None] = mapped_column(String(50), nullable=True)

    __table_args__ = (
        UniqueConstraint("source_artifact_id", "row_number", name="uq_raw_staging_skill_artifact_row"),
        CheckConstraint("validation_status IS NULL OR validation_status IN ('pending', 'passed', 'failed', 'blocked')", name="ck_raw_staging_skill_validation_status"),
        Index("ix_raw_staging_skills_artifact_id", "source_artifact_id"),
        Index("ix_raw_staging_skills_validation_status", "validation_status"),
    )


class RawStagingJobRole(TimestampMixin, Base):
    """Immutable raw job role record from source artifact."""
    __tablename__ = "raw_staging_job_roles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ingestion_run_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("data_ingestion_runs.id", ondelete="CASCADE"), nullable=False)
    source_artifact_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("source_artifacts.id", ondelete="CASCADE"), nullable=False)
    row_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    raw_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    validation_status: Mapped[str | None] = mapped_column(String(30), nullable=True)
    validation_errors: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    dataset_label: Mapped[str | None] = mapped_column(String(50), nullable=True)

    __table_args__ = (
        UniqueConstraint("source_artifact_id", "row_number", name="uq_raw_staging_job_role_artifact_row"),
        CheckConstraint("validation_status IS NULL OR validation_status IN ('pending', 'passed', 'failed', 'blocked')", name="ck_raw_staging_job_role_validation_status"),
        Index("ix_raw_staging_job_roles_artifact_id", "source_artifact_id"),
        Index("ix_raw_staging_job_roles_validation_status", "validation_status"),
    )


class StagingCourse(TimestampMixin, Base):
    """Validated and mapped course record ready for review."""
    __tablename__ = "staging_courses"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    raw_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("raw_staging_courses.id", ondelete="CASCADE"), nullable=False)
    source_course_code: Mapped[str | None] = mapped_column(String(100), nullable=True)
    source_version: Mapped[str | None] = mapped_column(String(50), nullable=True)
    title: Mapped[str | None] = mapped_column(String(300), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    duration_hours: Mapped[int | None] = mapped_column(Integer, nullable=True)
    nsqf_level: Mapped[int | None] = mapped_column(Integer, nullable=True)
    nqr_code: Mapped[str | None] = mapped_column(String(150), nullable=True)
    qualification: Mapped[str | None] = mapped_column(Text, nullable=True)
    cost_category: Mapped[str | None] = mapped_column(String(50), nullable=True)
    rate_per_hour: Mapped[float | None] = mapped_column(nullable=True)
    district_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("districts.id", ondelete="SET NULL"), nullable=True)
    sector_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("industry_sectors.id", ondelete="SET NULL"), nullable=True)
    data_source_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("data_sources.id", ondelete="RESTRICT"), nullable=True)
    ingestion_run_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("data_ingestion_runs.id", ondelete="RESTRICT"), nullable=True)
    source_record_identifier: Mapped[str | None] = mapped_column(String(255), nullable=True)
    review_status: Mapped[str | None] = mapped_column(String(30), nullable=True)
    reviewed_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    review_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    mapping_status: Mapped[str | None] = mapped_column(String(30), nullable=True)
    validation_status: Mapped[str | None] = mapped_column(String(30), nullable=True)
    dataset_label: Mapped[str | None] = mapped_column(String(50), nullable=True)

    __table_args__ = (
        CheckConstraint("review_status IS NULL OR review_status IN ('pending', 'approved', 'rejected')", name="ck_staging_course_review_status"),
        CheckConstraint("mapping_status IS NULL OR mapping_status IN ('READY', 'REVIEW_REQUIRED', 'BLOCKED')", name="ck_staging_course_mapping_status"),
        CheckConstraint("validation_status IS NULL OR validation_status IN ('pending', 'passed', 'failed', 'blocked')", name="ck_staging_course_validation_status"),
        Index("ix_staging_courses_raw_id", "raw_id"),
        Index("ix_staging_courses_district_id", "district_id"),
        Index("ix_staging_courses_sector_id", "sector_id"),
        Index("ix_staging_courses_review_status", "review_status"),
    )


class StagingProvider(TimestampMixin, Base):
    """Validated and mapped provider record ready for review."""
    __tablename__ = "staging_providers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    raw_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("raw_staging_providers.id", ondelete="CASCADE"), nullable=False)
    source_provider_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    district_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("districts.id", ondelete="SET NULL"), nullable=True)
    city: Mapped[str | None] = mapped_column(String(255), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    contact_person: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    provider_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    source_scheme: Mapped[str | None] = mapped_column(String(255), nullable=True)
    source_sector: Mapped[str | None] = mapped_column(String(255), nullable=True)
    data_source_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("data_sources.id", ondelete="RESTRICT"), nullable=True)
    ingestion_run_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("data_ingestion_runs.id", ondelete="RESTRICT"), nullable=True)
    review_status: Mapped[str | None] = mapped_column(String(30), nullable=True)
    reviewed_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    review_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    mapping_status: Mapped[str | None] = mapped_column(String(30), nullable=True)
    validation_status: Mapped[str | None] = mapped_column(String(30), nullable=True)
    dataset_label: Mapped[str | None] = mapped_column(String(50), nullable=True)

    __table_args__ = (
        CheckConstraint("provider_type IS NULL OR provider_type IN ('government', 'private', 'ngo', 'ppp')", name="ck_staging_provider_type"),
        CheckConstraint("review_status IS NULL OR review_status IN ('pending', 'approved', 'rejected')", name="ck_staging_provider_review_status"),
        CheckConstraint("mapping_status IS NULL OR mapping_status IN ('READY', 'REVIEW_REQUIRED', 'BLOCKED')", name="ck_staging_provider_mapping_status"),
        CheckConstraint("validation_status IS NULL OR validation_status IN ('pending', 'passed', 'failed', 'blocked')", name="ck_staging_provider_validation_status"),
        Index("ix_staging_providers_raw_id", "raw_id"),
        Index("ix_staging_providers_district_id", "district_id"),
        Index("ix_staging_providers_review_status", "review_status"),
    )


class StagingSkill(TimestampMixin, Base):
    """Validated and mapped skill record ready for review."""
    __tablename__ = "staging_skills"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    raw_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("raw_staging_skills.id", ondelete="CASCADE"), nullable=False)
    source_skill_name: Mapped[str | None] = mapped_column(String(150), nullable=True)
    canonical_skill_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("skills.id", ondelete="SET NULL"), nullable=True)
    mapping_status: Mapped[str | None] = mapped_column(String(30), nullable=True)
    mapping_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    review_status: Mapped[str | None] = mapped_column(String(30), nullable=True)
    reviewed_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    review_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    dataset_label: Mapped[str | None] = mapped_column(String(50), nullable=True)

    __table_args__ = (
        CheckConstraint("mapping_status IS NULL OR mapping_status IN ('MATCHED', 'REVIEW_REQUIRED', 'UNMAPPED', 'INSUFFICIENT_EVIDENCE')", name="ck_staging_skill_mapping_status"),
        CheckConstraint("review_status IS NULL OR review_status IN ('pending', 'approved', 'rejected')", name="ck_staging_skill_review_status"),
        Index("ix_staging_skills_raw_id", "raw_id"),
        Index("ix_staging_skills_canonical_id", "canonical_skill_id"),
        Index("ix_staging_skills_mapping_status", "mapping_status"),
    )


class StagingJobRole(TimestampMixin, Base):
    """Validated and mapped job role record ready for review."""
    __tablename__ = "staging_job_roles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    raw_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("raw_staging_job_roles.id", ondelete="CASCADE"), nullable=False)
    source_role_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    canonical_job_role_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("job_roles.id", ondelete="SET NULL"), nullable=True)
    mapping_status: Mapped[str | None] = mapped_column(String(30), nullable=True)
    mapping_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    review_status: Mapped[str | None] = mapped_column(String(30), nullable=True)
    reviewed_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    review_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    dataset_label: Mapped[str | None] = mapped_column(String(50), nullable=True)

    __table_args__ = (
        CheckConstraint("mapping_status IS NULL OR mapping_status IN ('MATCHED', 'REVIEW_REQUIRED', 'UNMAPPED', 'INSUFFICIENT_EVIDENCE')", name="ck_staging_job_role_mapping_status"),
        CheckConstraint("review_status IS NULL OR review_status IN ('pending', 'approved', 'rejected')", name="ck_staging_job_role_review_status"),
        Index("ix_staging_job_roles_raw_id", "raw_id"),
        Index("ix_staging_job_roles_canonical_id", "canonical_job_role_id"),
        Index("ix_staging_job_roles_mapping_status", "mapping_status"),
    )


class PromotionAuditLog(TimestampMixin, Base):
    """Immutable audit trail for promotion attempts."""
    __tablename__ = "promotion_audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    raw_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    target_table: Mapped[str] = mapped_column(String(100), nullable=False)
    target_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    attempted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    attempted_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    failure_reason: Mapped[str | None] = mapped_column(String(500), nullable=True)
    log_metadata: Mapped[dict | None] = mapped_column("metadata", JSON, nullable=True)

    __table_args__ = (
        CheckConstraint("status IN ('success', 'failed', 'blocked')", name="ck_promotion_audit_status"),
        Index("ix_promotion_audit_raw_id", "raw_id"),
        Index("ix_promotion_audit_target", "target_table", "target_id"),
        Index("ix_promotion_audit_attempted_at", "attempted_at"),
    )
