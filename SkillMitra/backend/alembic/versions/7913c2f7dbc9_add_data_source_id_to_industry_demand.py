"""add_data_source_id_to_industry_demand

Revision ID: 7913c2f7dbc9
Revises: 4a6cc75ef679
Create Date: 2026-08-28

Adds data_source_id to industry_demand for source-type filtering.
"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql as pg


revision: str = '7913c2f7dbc9'
down_revision: Union[str, None] = '4a6cc75ef679'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('industry_demand', sa.Column('data_source_id', pg.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key('fk_industry_demand_data_source_id', 'industry_demand', 'data_sources', ['data_source_id'], ['id'], ondelete='SET NULL')
    op.create_index('ix_industry_demand_data_source_id', 'industry_demand', ['data_source_id'])


def downgrade() -> None:
    op.drop_index('ix_industry_demand_data_source_id', table_name='industry_demand')
    op.drop_constraint('fk_industry_demand_data_source_id', 'industry_demand', type_='foreignkey')
    op.drop_column('industry_demand', 'data_source_id')
