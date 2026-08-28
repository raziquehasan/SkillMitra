"""Phase 6.11 staging infrastructure for verified additional datasets.

Revision ID: 6b7c8d9e0f1a
Revises: 9a0b1c2d3e4f
Create Date: 2026-08-28 18:30:00.000000
"""
from __future__ import annotations
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '6b7c8d9e0f1a'
down_revision: Union[str, None] = '9a0b1c2d3e4f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "source_artifacts",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("artifact_type", sa.String(length=50), nullable=False),
        sa.Column("filename", sa.String(length=255), nullable=False),
        sa.Column("file_size_bytes", sa.Integer(), nullable=True),
        sa.Column("sha256", sa.String(length=64), nullable=True),
        sa.Column("mime_type", sa.String(length=100), nullable=True),
        sa.Column("retrieved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("retrieved_by", sa.String(length=255), nullable=True),
        sa.Column("source_url", sa.String(length=500), nullable=True),
        sa.Column("retrieval_method", sa.String(length=100), nullable=True),
        sa.Column("access_context", sa.String(length=100), nullable=True),
        sa.Column("license", sa.String(length=255), nullable=True),
        sa.Column("version", sa.String(length=50), nullable=True),
        sa.Column("fiscal_year", sa.String(length=20), nullable=True),
        sa.Column("is_official", sa.Boolean(), nullable=True),
        sa.Column("metadata_json", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("filename", "sha256", name="uq_source_artifact_filename_sha"),
    )
    op.create_index("ix_source_artifacts_sha256", "source_artifacts", ["sha256"], unique=False)

    op.create_table(
        "raw_staging_courses",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("ingestion_run_id", sa.UUID(), nullable=False),
        sa.Column("source_artifact_id", sa.UUID(), nullable=False),
        sa.Column("row_number", sa.Integer(), nullable=True),
        sa.Column("raw_data", sa.JSON(), nullable=True),
        sa.Column("source_course_code", sa.String(length=100), nullable=True),
        sa.Column("source_version", sa.String(length=50), nullable=True),
        sa.Column("validation_status", sa.String(length=30), nullable=True),
        sa.Column("validation_errors", sa.JSON(), nullable=True),
        sa.Column("dataset_label", sa.String(length=50), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["ingestion_run_id"], ["data_ingestion_runs.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["source_artifact_id"], ["source_artifacts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("source_artifact_id", "row_number", name="uq_raw_staging_course_artifact_row"),
        sa.CheckConstraint("validation_status IS NULL OR validation_status IN ('pending', 'passed', 'failed', 'blocked')", name="ck_raw_staging_course_validation_status"),
    )
    op.create_index("ix_raw_staging_courses_artifact_id", "raw_staging_courses", ["source_artifact_id"], unique=False)
    op.create_index("ix_raw_staging_courses_validation_status", "raw_staging_courses", ["validation_status"], unique=False)

    op.create_table(
        "raw_staging_providers",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("ingestion_run_id", sa.UUID(), nullable=False),
        sa.Column("source_artifact_id", sa.UUID(), nullable=False),
        sa.Column("row_number", sa.Integer(), nullable=True),
        sa.Column("raw_data", sa.JSON(), nullable=True),
        sa.Column("source_provider_id", sa.String(length=100), nullable=True),
        sa.Column("validation_status", sa.String(length=30), nullable=True),
        sa.Column("validation_errors", sa.JSON(), nullable=True),
        sa.Column("dataset_label", sa.String(length=50), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["ingestion_run_id"], ["data_ingestion_runs.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["source_artifact_id"], ["source_artifacts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("source_artifact_id", "row_number", name="uq_raw_staging_provider_artifact_row"),
        sa.CheckConstraint("validation_status IS NULL OR validation_status IN ('pending', 'passed', 'failed', 'blocked')", name="ck_raw_staging_provider_validation_status"),
    )
    op.create_index("ix_raw_staging_providers_artifact_id", "raw_staging_providers", ["source_artifact_id"], unique=False)
    op.create_index("ix_raw_staging_providers_validation_status", "raw_staging_providers", ["validation_status"], unique=False)

    op.create_table(
        "raw_staging_skills",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("ingestion_run_id", sa.UUID(), nullable=False),
        sa.Column("source_artifact_id", sa.UUID(), nullable=False),
        sa.Column("row_number", sa.Integer(), nullable=True),
        sa.Column("raw_data", sa.JSON(), nullable=True),
        sa.Column("validation_status", sa.String(length=30), nullable=True),
        sa.Column("validation_errors", sa.JSON(), nullable=True),
        sa.Column("dataset_label", sa.String(length=50), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["ingestion_run_id"], ["data_ingestion_runs.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["source_artifact_id"], ["source_artifacts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("source_artifact_id", "row_number", name="uq_raw_staging_skill_artifact_row"),
        sa.CheckConstraint("validation_status IS NULL OR validation_status IN ('pending', 'passed', 'failed', 'blocked')", name="ck_raw_staging_skill_validation_status"),
    )
    op.create_index("ix_raw_staging_skills_artifact_id", "raw_staging_skills", ["source_artifact_id"], unique=False)
    op.create_index("ix_raw_staging_skills_validation_status", "raw_staging_skills", ["validation_status"], unique=False)

    op.create_table(
        "raw_staging_job_roles",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("ingestion_run_id", sa.UUID(), nullable=False),
        sa.Column("source_artifact_id", sa.UUID(), nullable=False),
        sa.Column("row_number", sa.Integer(), nullable=True),
        sa.Column("raw_data", sa.JSON(), nullable=True),
        sa.Column("validation_status", sa.String(length=30), nullable=True),
        sa.Column("validation_errors", sa.JSON(), nullable=True),
        sa.Column("dataset_label", sa.String(length=50), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["ingestion_run_id"], ["data_ingestion_runs.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["source_artifact_id"], ["source_artifacts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("source_artifact_id", "row_number", name="uq_raw_staging_job_role_artifact_row"),
        sa.CheckConstraint("validation_status IS NULL OR validation_status IN ('pending', 'passed', 'failed', 'blocked')", name="ck_raw_staging_job_role_validation_status"),
    )
    op.create_index("ix_raw_staging_job_roles_artifact_id", "raw_staging_job_roles", ["source_artifact_id"], unique=False)
    op.create_index("ix_raw_staging_job_roles_validation_status", "raw_staging_job_roles", ["validation_status"], unique=False)

    op.create_table(
        "staging_courses",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("raw_id", sa.UUID(), nullable=False),
        sa.Column("source_course_code", sa.String(length=100), nullable=True),
        sa.Column("source_version", sa.String(length=50), nullable=True),
        sa.Column("title", sa.String(length=300), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("duration_hours", sa.Integer(), nullable=True),
        sa.Column("nsqf_level", sa.Integer(), nullable=True),
        sa.Column("nqr_code", sa.String(length=150), nullable=True),
        sa.Column("qualification", sa.Text(), nullable=True),
        sa.Column("cost_category", sa.String(length=50), nullable=True),
        sa.Column("rate_per_hour", sa.Float(), nullable=True),
        sa.Column("district_id", sa.UUID(), nullable=True),
        sa.Column("sector_id", sa.UUID(), nullable=True),
        sa.Column("data_source_id", sa.UUID(), nullable=True),
        sa.Column("ingestion_run_id", sa.UUID(), nullable=True),
        sa.Column("source_record_identifier", sa.String(length=255), nullable=True),
        sa.Column("review_status", sa.String(length=30), nullable=True),
        sa.Column("reviewed_by", sa.UUID(), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("review_notes", sa.Text(), nullable=True),
        sa.Column("mapping_status", sa.String(length=30), nullable=True),
        sa.Column("validation_status", sa.String(length=30), nullable=True),
        sa.Column("dataset_label", sa.String(length=50), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["data_source_id"], ["data_sources.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["district_id"], ["districts.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["ingestion_run_id"], ["data_ingestion_runs.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["raw_id"], ["raw_staging_courses.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["reviewed_by"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["sector_id"], ["industry_sectors.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint("review_status IS NULL OR review_status IN ('pending', 'approved', 'rejected')", name="ck_staging_course_review_status"),
        sa.CheckConstraint("mapping_status IS NULL OR mapping_status IN ('READY', 'REVIEW_REQUIRED', 'BLOCKED')", name="ck_staging_course_mapping_status"),
        sa.CheckConstraint("validation_status IS NULL OR validation_status IN ('pending', 'passed', 'failed', 'blocked')", name="ck_staging_course_validation_status"),
    )
    op.create_index("ix_staging_courses_raw_id", "staging_courses", ["raw_id"], unique=False)
    op.create_index("ix_staging_courses_district_id", "staging_courses", ["district_id"], unique=False)
    op.create_index("ix_staging_courses_sector_id", "staging_courses", ["sector_id"], unique=False)
    op.create_index("ix_staging_courses_review_status", "staging_courses", ["review_status"], unique=False)

    op.create_table(
        "staging_providers",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("raw_id", sa.UUID(), nullable=False),
        sa.Column("source_provider_id", sa.String(length=100), nullable=True),
        sa.Column("name", sa.String(length=255), nullable=True),
        sa.Column("district_id", sa.UUID(), nullable=True),
        sa.Column("city", sa.String(length=255), nullable=True),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("contact_person", sa.String(length=255), nullable=True),
        sa.Column("phone", sa.String(length=20), nullable=True),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("provider_type", sa.String(length=50), nullable=True),
        sa.Column("source_scheme", sa.String(length=255), nullable=True),
        sa.Column("source_sector", sa.String(length=255), nullable=True),
        sa.Column("data_source_id", sa.UUID(), nullable=True),
        sa.Column("ingestion_run_id", sa.UUID(), nullable=True),
        sa.Column("review_status", sa.String(length=30), nullable=True),
        sa.Column("reviewed_by", sa.UUID(), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("review_notes", sa.Text(), nullable=True),
        sa.Column("mapping_status", sa.String(length=30), nullable=True),
        sa.Column("validation_status", sa.String(length=30), nullable=True),
        sa.Column("dataset_label", sa.String(length=50), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["data_source_id"], ["data_sources.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["district_id"], ["districts.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["ingestion_run_id"], ["data_ingestion_runs.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["raw_id"], ["raw_staging_providers.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["reviewed_by"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint("provider_type IS NULL OR provider_type IN ('government', 'private', 'ngo', 'ppp')", name="ck_staging_provider_type"),
        sa.CheckConstraint("review_status IS NULL OR review_status IN ('pending', 'approved', 'rejected')", name="ck_staging_provider_review_status"),
        sa.CheckConstraint("mapping_status IS NULL OR mapping_status IN ('READY', 'REVIEW_REQUIRED', 'BLOCKED')", name="ck_staging_provider_mapping_status"),
        sa.CheckConstraint("validation_status IS NULL OR validation_status IN ('pending', 'passed', 'failed', 'blocked')", name="ck_staging_provider_validation_status"),
    )
    op.create_index("ix_staging_providers_raw_id", "staging_providers", ["raw_id"], unique=False)
    op.create_index("ix_staging_providers_district_id", "staging_providers", ["district_id"], unique=False)
    op.create_index("ix_staging_providers_review_status", "staging_providers", ["review_status"], unique=False)

    op.create_table(
        "staging_skills",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("raw_id", sa.UUID(), nullable=False),
        sa.Column("source_skill_name", sa.String(length=150), nullable=True),
        sa.Column("canonical_skill_id", sa.UUID(), nullable=True),
        sa.Column("mapping_status", sa.String(length=30), nullable=True),
        sa.Column("mapping_notes", sa.Text(), nullable=True),
        sa.Column("review_status", sa.String(length=30), nullable=True),
        sa.Column("reviewed_by", sa.UUID(), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("review_notes", sa.Text(), nullable=True),
        sa.Column("dataset_label", sa.String(length=50), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["canonical_skill_id"], ["skills.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["raw_id"], ["raw_staging_skills.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["reviewed_by"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint("mapping_status IS NULL OR mapping_status IN ('MATCHED', 'REVIEW_REQUIRED', 'UNMAPPED', 'INSUFFICIENT_EVIDENCE')", name="ck_staging_skill_mapping_status"),
        sa.CheckConstraint("review_status IS NULL OR review_status IN ('pending', 'approved', 'rejected')", name="ck_staging_skill_review_status"),
    )
    op.create_index("ix_staging_skills_raw_id", "staging_skills", ["raw_id"], unique=False)
    op.create_index("ix_staging_skills_canonical_id", "staging_skills", ["canonical_skill_id"], unique=False)
    op.create_index("ix_staging_skills_mapping_status", "staging_skills", ["mapping_status"], unique=False)

    op.create_table(
        "staging_job_roles",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("raw_id", sa.UUID(), nullable=False),
        sa.Column("source_role_name", sa.String(length=200), nullable=True),
        sa.Column("canonical_job_role_id", sa.UUID(), nullable=True),
        sa.Column("mapping_status", sa.String(length=30), nullable=True),
        sa.Column("mapping_notes", sa.Text(), nullable=True),
        sa.Column("review_status", sa.String(length=30), nullable=True),
        sa.Column("reviewed_by", sa.UUID(), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("review_notes", sa.Text(), nullable=True),
        sa.Column("dataset_label", sa.String(length=50), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["canonical_job_role_id"], ["job_roles.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["raw_id"], ["raw_staging_job_roles.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["reviewed_by"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint("mapping_status IS NULL OR mapping_status IN ('MATCHED', 'REVIEW_REQUIRED', 'UNMAPPED', 'INSUFFICIENT_EVIDENCE')", name="ck_staging_job_role_mapping_status"),
        sa.CheckConstraint("review_status IS NULL OR review_status IN ('pending', 'approved', 'rejected')", name="ck_staging_job_role_review_status"),
    )
    op.create_index("ix_staging_job_roles_raw_id", "staging_job_roles", ["raw_id"], unique=False)
    op.create_index("ix_staging_job_roles_canonical_id", "staging_job_roles", ["canonical_job_role_id"], unique=False)
    op.create_index("ix_staging_job_roles_mapping_status", "staging_job_roles", ["mapping_status"], unique=False)

    op.create_table(
        "promotion_audit_logs",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("raw_id", sa.UUID(), nullable=False),
        sa.Column("target_table", sa.String(length=100), nullable=False),
        sa.Column("target_id", sa.UUID(), nullable=True),
        sa.Column("attempted_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("attempted_by", sa.UUID(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("failure_reason", sa.String(length=500), nullable=True),
        sa.Column("metadata", sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(["attempted_by"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint("status IN ('success', 'failed', 'blocked')", name="ck_promotion_audit_status"),
    )
    op.create_index("ix_promotion_audit_raw_id", "promotion_audit_logs", ["raw_id"], unique=False)
    op.create_index("ix_promotion_audit_target", "promotion_audit_logs", ["target_table", "target_id"], unique=False)
    op.create_index("ix_promotion_audit_attempted_at", "promotion_audit_logs", ["attempted_at"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_promotion_audit_attempted_at", table_name="promotion_audit_logs")
    op.drop_index("ix_promotion_audit_target", table_name="promotion_audit_logs")
    op.drop_index("ix_promotion_audit_raw_id", table_name="promotion_audit_logs")
    op.drop_table("promotion_audit_logs")

    op.drop_index("ix_staging_job_roles_mapping_status", table_name="staging_job_roles")
    op.drop_index("ix_staging_job_roles_canonical_id", table_name="staging_job_roles")
    op.drop_index("ix_staging_job_roles_raw_id", table_name="staging_job_roles")
    op.drop_table("staging_job_roles")

    op.drop_index("ix_staging_skills_mapping_status", table_name="staging_skills")
    op.drop_index("ix_staging_skills_canonical_id", table_name="staging_skills")
    op.drop_index("ix_staging_skills_raw_id", table_name="staging_skills")
    op.drop_table("staging_skills")

    op.drop_index("ix_staging_providers_review_status", table_name="staging_providers")
    op.drop_index("ix_staging_providers_district_id", table_name="staging_providers")
    op.drop_index("ix_staging_providers_raw_id", table_name="staging_providers")
    op.drop_table("staging_providers")

    op.drop_index("ix_staging_courses_review_status", table_name="staging_courses")
    op.drop_index("ix_staging_courses_sector_id", table_name="staging_courses")
    op.drop_index("ix_staging_courses_district_id", table_name="staging_courses")
    op.drop_index("ix_staging_courses_raw_id", table_name="staging_courses")
    op.drop_table("staging_courses")

    op.drop_index("ix_raw_staging_job_roles_validation_status", table_name="raw_staging_job_roles")
    op.drop_index("ix_raw_staging_job_roles_artifact_id", table_name="raw_staging_job_roles")
    op.drop_constraint("uq_raw_staging_job_role_artifact_row", "raw_staging_job_roles", type_="unique")
    op.drop_check_constraint("ck_raw_staging_job_role_validation_status", "raw_staging_job_roles")
    op.drop_table("raw_staging_job_roles")

    op.drop_index("ix_raw_staging_skills_validation_status", table_name="raw_staging_skills")
    op.drop_index("ix_raw_staging_skills_artifact_id", table_name="raw_staging_skills")
    op.drop_constraint("uq_raw_staging_skill_artifact_row", "raw_staging_skills", type_="unique")
    op.drop_check_constraint("ck_raw_staging_skill_validation_status", "raw_staging_skills")
    op.drop_table("raw_staging_skills")

    op.drop_index("ix_raw_staging_providers_validation_status", table_name="raw_staging_providers")
    op.drop_index("ix_raw_staging_providers_artifact_id", table_name="raw_staging_providers")
    op.drop_constraint("uq_raw_staging_provider_artifact_row", "raw_staging_providers", type_="unique")
    op.drop_check_constraint("ck_raw_staging_provider_validation_status", "raw_staging_providers")
    op.drop_table("raw_staging_providers")

    op.drop_index("ix_raw_staging_courses_validation_status", table_name="raw_staging_courses")
    op.drop_index("ix_raw_staging_courses_artifact_id", table_name="raw_staging_courses")
    op.drop_constraint("uq_raw_staging_course_artifact_row", "raw_staging_courses", type_="unique")
    op.drop_check_constraint("ck_raw_staging_course_validation_status", "raw_staging_courses")
    op.drop_table("raw_staging_courses")

    op.drop_index("ix_source_artifacts_sha256", table_name="source_artifacts")
    op.drop_constraint("uq_source_artifact_filename_sha", "source_artifacts", type_="unique")
    op.drop_table("source_artifacts")
