"""add_future_demand_forecasting

Revision ID: ba122596d430
Revises: 9a0b1c2d3e4f
Create Date: 2026-09-02 12:13:37.378906

"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ba122596d430'
down_revision: Union[str, None] = '9a0b1c2d3e4f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create future_demand_forecasts table
    op.create_table(
        'future_demand_forecasts',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('skill_id', sa.UUID(), nullable=False),
        sa.Column('job_role_id', sa.UUID(), nullable=True),
        sa.Column('industry_sector_id', sa.UUID(), nullable=False),
        sa.Column('district_id', sa.UUID(), nullable=False),
        sa.Column('proficiency_level_id', sa.UUID(), nullable=False),
        sa.Column('current_demand_score', sa.Float(), nullable=False),
        sa.Column('current_demand_level', sa.String(length=20), nullable=False),
        sa.Column('trend_score', sa.Float(), nullable=False),
        sa.Column('growth_indicator', sa.String(length=20), nullable=False),
        sa.Column('forecast_level', sa.String(length=20), nullable=False),
        sa.Column('confidence_score', sa.Float(), nullable=False),
        sa.Column('confidence_level', sa.String(length=20), nullable=False),
        sa.Column('forecast_horizon_months', sa.Integer(), nullable=False),
        sa.Column('forecast_horizon_start', sa.Date(), nullable=False),
        sa.Column('forecast_horizon_end', sa.Date(), nullable=False),
        sa.Column('evidence_summary', sa.Text(), nullable=True),
        sa.Column('algorithm_version', sa.String(length=50), nullable=False),
        sa.Column('data_points_used', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['district_id'], ['districts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['industry_sector_id'], ['industry_sectors.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['job_role_id'], ['job_roles.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['proficiency_level_id'], ['skill_proficiency_levels.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['skill_id'], ['skills.id'], ondelete='CASCADE'),
        sa.CheckConstraint('confidence_level IN (\'high\', \'medium\', \'low\', \'insufficient_evidence\')', name='ck_confidence_level'),
        sa.CheckConstraint('current_demand_level IN (\'very_high\', \'high\', \'medium\', \'low\', \'insufficient_data\')', name='ck_current_demand_level'),
        sa.CheckConstraint('forecast_level IN (\'very_high\', \'high\', \'growing\', \'stable\', \'declining\', \'insufficient_data\')', name='ck_forecast_level'),
        sa.CheckConstraint('growth_indicator IN (\'increasing\', \'decreasing\', \'stable\', \'unknown\')', name='ck_growth_indicator'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('skill_id', 'job_role_id', 'district_id', 'forecast_horizon_start', 'forecast_horizon_end', name='uq_forecast_unique_key')
    )
    op.create_index('ix_future_demand_confidence_level', 'future_demand_forecasts', ['confidence_level'], unique=False)
    op.create_index('ix_future_demand_district_id', 'future_demand_forecasts', ['district_id'], unique=False)
    op.create_index('ix_future_demand_forecast_level', 'future_demand_forecasts', ['forecast_level'], unique=False)
    op.create_index('ix_future_demand_job_role_id', 'future_demand_forecasts', ['job_role_id'], unique=False)
    op.create_index('ix_future_demand_skill_id', 'future_demand_forecasts', ['skill_id'], unique=False)


def downgrade() -> None:
    # Drop future_demand_forecasts table
    op.drop_index('ix_future_demand_skill_id', table_name='future_demand_forecasts')
    op.drop_index('ix_future_demand_job_role_id', table_name='future_demand_forecasts')
    op.drop_index('ix_future_demand_forecast_level', table_name='future_demand_forecasts')
    op.drop_index('ix_future_demand_district_id', table_name='future_demand_forecasts')
    op.drop_index('ix_future_demand_confidence_level', table_name='future_demand_forecasts')
    op.drop_table('future_demand_forecasts')
