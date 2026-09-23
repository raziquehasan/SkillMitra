"""add_emerging_technology_id_to_industry_demand

Revision ID: 5eaad5d69937
Revises: f5eba89f5007
Create Date: 2026-09-23 15:55:09.411721

"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql as pg


# revision identifiers, used by Alembic.
revision: str = '5eaad5d69937'
down_revision: Union[str, None] = 'f5eba89f5007'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add emerging_technology_id column to industry_demand
    op.add_column('industry_demand', sa.Column('emerging_technology_id', pg.UUID(as_uuid=True), nullable=True))
    # Add foreign key constraint with ON DELETE SET NULL
    op.create_foreign_key(
        'fk_industry_demand_emerging_technology_id',
        'industry_demand',
        'emerging_technologies',
        ['emerging_technology_id'],
        ['id'],
        ondelete='SET NULL'
    )
    # Add index for performance
    op.create_index('ix_industry_demand_emerging_technology_id', 'industry_demand', ['emerging_technology_id'])


def downgrade() -> None:
    # Remove index
    op.drop_index('ix_industry_demand_emerging_technology_id', table_name='industry_demand')
    # Remove foreign key constraint
    op.drop_constraint('fk_industry_demand_emerging_technology_id', 'industry_demand', type_='foreignkey')
    # Remove column
    op.drop_column('industry_demand', 'emerging_technology_id')
