"""phase8 SIH gap-fill: gov officials, emerging tech, course health, registration fields

Revision ID: a1b2c3d4e5f6
Revises: 1894783f5fe2
Create Date: 2026-08-27

Minimal additive migration. No existing tables are recreated, renamed,
or dropped. No existing data is modified.
"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql as pg


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '1894783f5fe2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── 1. Minimal column additions to EXISTING tables ──────────────
    op.add_column('candidate_profiles', sa.Column('gender', sa.String(length=20), nullable=True))
    op.add_column('employers', sa.Column('contact_person', sa.String(length=255), nullable=True))
    op.add_column('employers', sa.Column('phone', sa.String(length=20), nullable=True))
    op.add_column('employers', sa.Column('organization_type', sa.String(length=50), nullable=True))
    op.add_column('training_providers', sa.Column('contact_person', sa.String(length=255), nullable=True))
    op.add_column('training_providers', sa.Column('phone', sa.String(length=20), nullable=True))
    op.add_column('training_providers', sa.Column('provider_type', sa.String(length=50), nullable=True))
    op.create_check_constraint(
        'ck_training_providers_provider_type', 'training_providers',
        "provider_type IS NULL OR provider_type IN ('government', 'private', 'ngo', 'ppp')",
    )
    op.add_column('district_training_plan_items', sa.Column('recommended_action', sa.String(length=40), nullable=True))
    op.add_column('district_training_plan_items', sa.Column('rationale', sa.Text(), nullable=True))
    op.create_check_constraint(
        'ck_district_plan_items_recommended_action', 'district_training_plan_items',
        "recommended_action IS NULL OR recommended_action IN ('increase_capacity', 'maintain_capacity', 'reduce_capacity', 'new_course', 'curriculum_update', 'trainer_upskilling', 'equipment_upgrade')",
    )

    # ── 2. government_officials (approval workflow) ─────────────────
    op.create_table(
        'government_officials',
        sa.Column('id', pg.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', pg.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('district_id', pg.UUID(as_uuid=True),
                  sa.ForeignKey('districts.id', ondelete='SET NULL'), nullable=True),
        sa.Column('department', sa.String(length=255), nullable=False),
        sa.Column('designation', sa.String(length=255), nullable=False),
        sa.Column('employee_code', sa.String(length=100), nullable=True),
        sa.Column('verification_status', sa.String(length=30), nullable=False,
                  server_default='pending_verification'),
        sa.Column('submitted_documents', sa.JSON(), nullable=True),
        sa.Column('reviewed_by_user_id', pg.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('review_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "verification_status IN ('pending_verification', 'approved', 'rejected')",
            name='ck_gov_officials_verification_status',
        ),
    )
    op.create_index('ix_gov_officials_user_id', 'government_officials', ['user_id'])
    op.create_index('ix_gov_officials_district_id', 'government_officials', ['district_id'])
    op.create_index('ix_gov_officials_verification_status', 'government_officials', ['verification_status'])

    # ── 3. emerging_technologies (STEP 6) ───────────────────────────
    op.create_table(
        'emerging_technologies',
        sa.Column('id', pg.UUID(as_uuid=True), primary_key=True),
        sa.Column('technology_name', sa.String(length=200), nullable=False),
        sa.Column('industry_sector_id', pg.UUID(as_uuid=True),
                  sa.ForeignKey('industry_sectors.id', ondelete='SET NULL'), nullable=True),
        sa.Column('district_id', pg.UUID(as_uuid=True),
                  sa.ForeignKey('districts.id', ondelete='SET NULL'), nullable=True),
        sa.Column('trend_direction', sa.String(length=20), nullable=False),
        sa.Column('growth_indicator', sa.Float(), nullable=True),
        sa.Column('observation_start', sa.Date(), nullable=True),
        sa.Column('observation_end', sa.Date(), nullable=True),
        sa.Column('confidence', sa.String(length=20), nullable=False, server_default='medium'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('data_source_id', pg.UUID(as_uuid=True),
                  sa.ForeignKey('data_sources.id', ondelete='SET NULL'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "trend_direction IN ('emerging', 'rising', 'stable', 'declining', 'obsolete')",
            name='ck_emerging_tech_trend_direction',
        ),
        sa.CheckConstraint(
            "confidence IN ('low', 'medium', 'high')",
            name='ck_emerging_tech_confidence',
        ),
        sa.CheckConstraint(
            "observation_start IS NULL OR observation_end IS NULL OR observation_start <= observation_end",
            name='ck_emerging_tech_period',
        ),
        sa.UniqueConstraint('technology_name', 'industry_sector_id', 'district_id',
                            'observation_start', 'observation_end',
                            name='uq_emerging_tech_observation'),
    )
    op.create_index('ix_emerging_tech_sector_id', 'emerging_technologies', ['industry_sector_id'])
    op.create_index('ix_emerging_tech_district_id', 'emerging_technologies', ['district_id'])
    op.create_index('ix_emerging_tech_trend_direction', 'emerging_technologies', ['trend_direction'])

    # ── 4. technology_skills (tech <-> skills) ──────────────────────
    op.create_table(
        'technology_skills',
        sa.Column('technology_id', pg.UUID(as_uuid=True),
                  sa.ForeignKey('emerging_technologies.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('skill_id', pg.UUID(as_uuid=True),
                  sa.ForeignKey('skills.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('relevance', sa.String(length=20), nullable=False, server_default='core'),
        sa.CheckConstraint(
            "relevance IN ('core', 'supporting', 'adjacent')",
            name='ck_technology_skills_relevance',
        ),
    )
    op.create_index('ix_technology_skills_skill_id', 'technology_skills', ['skill_id'])

    # ── 5. course_health_scores (STEP 7, human-review workflow) ─────
    op.create_table(
        'course_health_scores',
        sa.Column('id', pg.UUID(as_uuid=True), primary_key=True),
        sa.Column('course_id', pg.UUID(as_uuid=True),
                  sa.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False),
        sa.Column('industry_demand_score', sa.Float(), nullable=True),
        sa.Column('placement_score', sa.Float(), nullable=True),
        sa.Column('employer_validation_score', sa.Float(), nullable=True),
        sa.Column('curriculum_alignment_score', sa.Float(), nullable=True),
        sa.Column('future_trend_score', sa.Float(), nullable=True),
        sa.Column('supply_demand_score', sa.Float(), nullable=True),
        sa.Column('overall_score', sa.Float(), nullable=True),
        sa.Column('recommended_status', sa.String(length=30), nullable=False),
        sa.Column('review_status', sa.String(length=30), nullable=False,
                  server_default='pending_review'),
        sa.Column('reviewed_by_user_id', pg.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('review_notes', sa.Text(), nullable=True),
        sa.Column('final_status', sa.String(length=30), nullable=True),
        sa.Column('period_start', sa.Date(), nullable=True),
        sa.Column('period_end', sa.Date(), nullable=True),
        sa.Column('score_details', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "recommended_status IN ('relevant', 'needs_update', 'oversupplied', 'low_demand', 'obsolete_review')",
            name='ck_course_health_recommended_status',
        ),
        sa.CheckConstraint(
            "review_status IN ('pending_review', 'under_review', 'reviewed')",
            name='ck_course_health_review_status',
        ),
        sa.CheckConstraint(
            "final_status IS NULL OR final_status IN ('relevant', 'needs_update', 'oversupplied', 'low_demand', 'obsolete_review', 'dismissed')",
            name='ck_course_health_final_status',
        ),
        sa.CheckConstraint(
            "overall_score IS NULL OR (overall_score >= 0 AND overall_score <= 100)",
            name='ck_course_health_overall_range',
        ),
        sa.UniqueConstraint('course_id', 'period_start', 'period_end', name='uq_course_health_period'),
    )
    op.create_index('ix_course_health_course_id', 'course_health_scores', ['course_id'])
    op.create_index('ix_course_health_review_status', 'course_health_scores', ['review_status'])
    op.create_index('ix_course_health_recommended_status', 'course_health_scores', ['recommended_status'])


def downgrade() -> None:
    op.drop_index('ix_course_health_recommended_status', table_name='course_health_scores')
    op.drop_index('ix_course_health_review_status', table_name='course_health_scores')
    op.drop_index('ix_course_health_course_id', table_name='course_health_scores')
    op.drop_table('course_health_scores')
    op.drop_index('ix_technology_skills_skill_id', table_name='technology_skills')
    op.drop_table('technology_skills')
    op.drop_index('ix_emerging_tech_trend_direction', table_name='emerging_technologies')
    op.drop_index('ix_emerging_tech_district_id', table_name='emerging_technologies')
    op.drop_index('ix_emerging_tech_sector_id', table_name='emerging_technologies')
    op.drop_table('emerging_technologies')
    op.drop_index('ix_gov_officials_verification_status', table_name='government_officials')
    op.drop_index('ix_gov_officials_district_id', table_name='government_officials')
    op.drop_index('ix_gov_officials_user_id', table_name='government_officials')
    op.drop_table('government_officials')
    op.drop_constraint('ck_district_plan_items_recommended_action', 'district_training_plan_items', type_='check')
    op.drop_column('district_training_plan_items', 'rationale')
    op.drop_column('district_training_plan_items', 'recommended_action')
    op.drop_constraint('ck_training_providers_provider_type', 'training_providers', type_='check')
    op.drop_column('training_providers', 'provider_type')
    op.drop_column('training_providers', 'phone')
    op.drop_column('training_providers', 'contact_person')
    op.drop_column('employers', 'organization_type')
    op.drop_column('employers', 'phone')
    op.drop_column('employers', 'contact_person')
    op.drop_column('candidate_profiles', 'gender')