"""Phase 6.4 Schema Gap Resolution: Course Identity & Provenance, Training Provider Fields

Revision ID: 9a0b1c2d3e4f
Revises: 7913c2f7dbc9
Create Date: 2026-08-28 10:00:00.000000

"""
from __future__ import annotations
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '9a0b1c2d3e4f'
down_revision: Union[str, None] = '7913c2f7dbc9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Drop the old unique constraint on (data_source_id, source_course_code)
    op.drop_constraint('uq_courses_source_course_code', 'courses', type_='unique')

    # Create the new unique constraint on (data_source_id, source_course_code, source_version)
    op.create_unique_constraint('uq_courses_source_identity', 'courses', ['data_source_id', 'source_course_code', 'source_version'])

    # Add new columns for course provenance
    op.add_column('courses', sa.Column('source_file_name', sa.String(length=255), nullable=True))
    op.add_column('courses', sa.Column('source_file_hash', sa.String(length=64), nullable=True)) # SHA-256 is 64 chars
    op.add_column('courses', sa.Column('retrieved_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('courses', sa.Column('transformation_version', sa.String(length=50), nullable=True))
    op.add_column('courses', sa.Column('mapping_status', sa.String(length=30), nullable=True))
    op.add_column('courses', sa.Column('validation_status', sa.String(length=30), nullable=True))

    # Add new columns for training provider source fields
    op.add_column('training_providers', sa.Column('source_scheme', sa.String(length=255), nullable=True))
    op.add_column('training_providers', sa.Column('source_city', sa.String(length=255), nullable=True))
    op.add_column('training_providers', sa.Column('source_address', sa.Text(), nullable=True))
    op.add_column('training_providers', sa.Column('source_email', sa.String(length=255), nullable=True))
    op.add_column('training_providers', sa.Column('source_sector', sa.String(length=255), nullable=True))


def downgrade() -> None:
    # Reverse the changes for downgrade
    op.drop_column('training_providers', 'source_sector')
    op.drop_column('training_providers', 'source_email')
    op.drop_column('training_providers', 'source_address')
    op.drop_column('training_providers', 'source_city')
    op.drop_column('training_providers', 'source_scheme')

    op.drop_column('courses', 'validation_status')
    op.drop_column('courses', 'mapping_status')
    op.drop_column('courses', 'transformation_version')
    op.drop_column('courses', 'retrieved_at')
    op.drop_column('courses', 'source_file_hash')
    op.drop_column('courses', 'source_file_name')

    op.drop_constraint('uq_courses_source_identity', 'courses', type_='unique')
    op.create_unique_constraint('uq_courses_source_course_code', 'courses', ['data_source_id', 'source_course_code'])