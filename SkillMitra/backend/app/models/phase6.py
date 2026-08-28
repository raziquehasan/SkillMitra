"""Phase 6 evidence ingestion, normalization, and employer validation models."""
import uuid
from datetime import datetime
from sqlalchemy import CheckConstraint, Date, DateTime, ForeignKey, Index, Integer, JSON, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base, TimestampMixin


class DataIngestionRun(TimestampMixin, Base):
    __tablename__ = "data_ingestion_runs"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("data_sources.id", ondelete="RESTRICT"), nullable=False)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="started")
    records_received: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    records_accepted: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    records_rejected: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    records_deduplicated: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    error_summary: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    __table_args__ = (
        CheckConstraint("status IN ('started', 'completed', 'failed')", name="ck_ingestion_runs_status"),
        CheckConstraint("records_received >= 0 AND records_accepted >= 0 AND records_rejected >= 0 AND records_deduplicated >= 0", name="ck_ingestion_runs_counts"),
        Index("ix_ingestion_runs_source_id", "source_id"),
        Index("ix_ingestion_runs_started_at", "started_at"),
    )


class RawJobPosting(TimestampMixin, Base):
    __tablename__ = "raw_job_postings"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ingestion_run_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("data_ingestion_runs.id", ondelete="CASCADE"), nullable=False)
    source_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("data_sources.id", ondelete="RESTRICT"), nullable=False)
    external_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    employer_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    district_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("districts.id", ondelete="SET NULL"), nullable=True)
    posted_date: Mapped[object | None] = mapped_column(Date, nullable=True)
    raw_payload: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    normalization_status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
    rejection_reason: Mapped[str | None] = mapped_column(String(500), nullable=True)
    canonical_job_posting_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("job_postings.id", ondelete="SET NULL"), nullable=True)
    __table_args__ = (
        UniqueConstraint("source_id", "external_id", name="uq_raw_job_source_external"),
        CheckConstraint("normalization_status IN ('pending', 'accepted', 'rejected', 'duplicate', 'unmapped')", name="ck_raw_job_normalization_status"),
        Index("ix_raw_job_ingestion_run_id", "ingestion_run_id"),
        Index("ix_raw_job_normalization_status", "normalization_status"),
    )


class IngestionRejectedRecord(TimestampMixin, Base):
    __tablename__ = "ingestion_rejected_records"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ingestion_run_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("data_ingestion_runs.id", ondelete="CASCADE"), nullable=False)
    record_key: Mapped[str | None] = mapped_column(String(255), nullable=True)
    reason_code: Mapped[str] = mapped_column(String(50), nullable=False)
    reason_detail: Mapped[str | None] = mapped_column(String(500), nullable=True)
    raw_payload: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    __table_args__ = (Index("ix_rejected_records_run_id", "ingestion_run_id"),)


class JobRoleAlias(Base):
    __tablename__ = "job_role_aliases"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_role_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("job_roles.id", ondelete="CASCADE"), nullable=False)
    alias: Mapped[str] = mapped_column(String(200), nullable=False, unique=True)
    __table_args__ = (Index("ix_job_role_aliases_role_id", "job_role_id"),)


class IndustryConsultation(TimestampMixin, Base):
    __tablename__ = "industry_consultations"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("employers.id", ondelete="RESTRICT"), nullable=False)
    district_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("districts.id", ondelete="SET NULL"), nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    consultation_date: Mapped[object] = mapped_column(Date, nullable=False)
    feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    __table_args__ = (Index("ix_consultations_employer_id", "employer_id"), Index("ix_consultations_district_id", "district_id"))


class EmployerCurriculumValidation(TimestampMixin, Base):
    __tablename__ = "employer_curriculum_validations"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("employers.id", ondelete="RESTRICT"), nullable=False)
    course_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="RESTRICT"), nullable=False)
    curriculum_version_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("curriculum_versions.id", ondelete="SET NULL"), nullable=True)
    status: Mapped[str] = mapped_column(String(30), nullable=False)
    feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    source: Mapped[str] = mapped_column(String(50), nullable=False, default="employer")
    __table_args__ = (
        CheckConstraint("status IN ('relevant', 'partially_relevant', 'outdated', 'missing_skills', 'proficiency_mismatch', 'equipment_mismatch')", name="ck_curriculum_validation_status"),
        Index("ix_curriculum_validations_course_id", "course_id"),
        Index("ix_curriculum_validations_employer_id", "employer_id"),
    )
