"""phase9_operational_workflows

Revision ID: 4a6cc75ef679
Revises: a1b2c3d4e5f6
Create Date: 2026-08-28

Adds:
- district_training_plan_items review workflow columns
- training_providers verification workflow columns
- curriculum_proposals table
- audit_logs table
"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql as pg


revision: str = '4a6cc75ef679'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. district_training_plan_items review workflow
    op.add_column('district_training_plan_items', sa.Column('review_status', sa.String(length=30), nullable=True))
    op.add_column('district_training_plan_items', sa.Column('review_notes', sa.Text(), nullable=True))
    op.create_check_constraint(
        'ck_district_plan_items_review_status',
        'district_training_plan_items',
        "review_status IS NULL OR review_status IN ('pending_review', 'approved', 'rejected', 'needs_more_evidence')",
    )

    # 2. training_providers verification workflow
    op.add_column('training_providers', sa.Column('verification_status', sa.String(length=30), nullable=False, server_default='unverified'))
    op.add_column('training_providers', sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('training_providers', sa.Column('reviewed_by_user_id', pg.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True))
    op.add_column('training_providers', sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('training_providers', sa.Column('review_notes', sa.Text(), nullable=True))
    op.create_check_constraint(
        'ck_training_providers_verification_status',
        'training_providers',
        "verification_status IN ('unverified', 'pending_verification', 'verified', 'rejected')",
    )

    # 3. curriculum_proposals
    op.create_table(
        'curriculum_proposals',
        sa.Column('id', pg.UUID(as_uuid=True), primary_key=True),
        sa.Column('curriculum_version_id', pg.UUID(as_uuid=True),
                  sa.ForeignKey('curriculum_versions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('course_id', pg.UUID(as_uuid=True),
                  sa.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False),
        sa.Column('proposed_by_user_id', pg.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('proposed_changes', sa.JSON(), nullable=True),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=30), nullable=False, server_default='proposed'),
        sa.Column('reviewed_by_user_id', pg.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('review_notes', sa.Text(), nullable=True),
        sa.Column('employer_validated', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('implemented_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "status IN ('proposed', 'under_review', 'employer_validated', 'approved', 'rejected', 'implemented')",
            name='ck_curriculum_proposals_status',
        ),
    )
    op.create_index('ix_curriculum_proposals_curriculum_version_id', 'curriculum_proposals', ['curriculum_version_id'])
    op.create_index('ix_curriculum_proposals_course_id', 'curriculum_proposals', ['course_id'])
    op.create_index('ix_curriculum_proposals_status', 'curriculum_proposals', ['status'])

    # 4. audit_logs
    op.create_table(
        'audit_logs',
        sa.Column('id', pg.UUID(as_uuid=True), primary_key=True),
        sa.Column('actor_user_id', pg.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('action', sa.String(length=100), nullable=False),
        sa.Column('target_type', sa.String(length=50), nullable=False),
        sa.Column('target_id', pg.UUID(as_uuid=True), nullable=False),
        sa.Column('old_status', sa.String(length=50), nullable=True),
        sa.Column('new_status', sa.String(length=50), nullable=True),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_audit_logs_actor_user_id', 'audit_logs', ['actor_user_id'])
    op.create_index('ix_audit_logs_target', 'audit_logs', ['target_type', 'target_id'])
    op.create_index('ix_audit_logs_created_at', 'audit_logs', ['created_at'])


def downgrade() -> None:
    op.drop_index('ix_audit_logs_created_at', table_name='audit_logs')
    op.drop_index('ix_audit_logs_target', table_name='audit_logs')
    op.drop_index('ix_audit_logs_actor_user_id', table_name='audit_logs')
    op.drop_table('audit_logs')
    op.drop_index('ix_curriculum_proposals_status', table_name='curriculum_proposals')
    op.drop_index('ix_curriculum_proposals_course_id', table_name='curriculum_proposals')
    op.drop_index('ix_curriculum_proposals_curriculum_version_id', table_name='curriculum_proposals')
    op.drop_table('curriculum_proposals')
    op.drop_constraint('ck_training_providers_verification_status', 'training_providers', type_='check')
    op.drop_column('training_providers', 'review_notes')
    op.drop_column('training_providers', 'reviewed_at')
    op.drop_column('training_providers', 'reviewed_by_user_id')
    op.drop_column('training_providers', 'submitted_at')
    op.drop_column('training_providers', 'verification_status')
    op.drop_constraint('ck_district_plan_items_review_status', 'district_training_plan_items', type_='check')
    op.drop_column('district_training_plan_items', 'review_notes')
    op.drop_column('district_training_plan_items', 'review_status')
