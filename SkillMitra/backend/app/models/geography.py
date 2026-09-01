"""
Geography models: states, districts.

Phase 2A scope.
Phase 1 source: docs/database/ENTITY_DICTIONARY.md §2
"""

import uuid

from sqlalchemy import String, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class State(Base):
    __tablename__ = "states"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    code: Mapped[str] = mapped_column(String(10), nullable=False, unique=True)

    # Relationships
    districts: Mapped[list["District"]] = relationship(
        "District", back_populates="state"
    )


class District(Base):
    __tablename__ = "districts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    state_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("states.id", ondelete="RESTRICT"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(String(20), nullable=True)

    # Relationships
    state: Mapped["State"] = relationship("State", back_populates="districts")
    candidate_profiles: Mapped[list["CandidateProfile"]] = relationship(
        "CandidateProfile", back_populates="district"
    )
    government_officials: Mapped[list["GovernmentOfficial"]] = relationship(
        "GovernmentOfficial", back_populates="district"
    )
    courses: Mapped[list["Course"]] = relationship(
        "Course", back_populates="district"
    )

    __table_args__ = (
        Index("ix_districts_state_id", "state_id"),
    )
