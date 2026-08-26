"""
Identity models: users, candidate_profiles,
candidate_education_history, candidate_career_interests.

Phase 2A scope.
Phase 1 source: docs/database/ENTITY_DICTIONARY.md §1

NOTE: roles / user_roles are intentionally EXCLUDED from Phase 2A.
      Do NOT add a role column to users as a shortcut.
"""

import uuid
from datetime import date, datetime

from sqlalchemy import (
    Boolean, Date, DateTime, Float, ForeignKey,
    Integer, String, Text, Index,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(
        String(255), nullable=False, unique=True, index=True
    )
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # Relationships
    candidate_profile: Mapped["CandidateProfile | None"] = relationship(
        "CandidateProfile", back_populates="user", uselist=False
    )


class CandidateProfile(TimestampMixin, Base):
    __tablename__ = "candidate_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,       # enforces 1:1 with users
    )
    district_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("districts.id", ondelete="SET NULL"),
        nullable=True,
    )
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    education_level: Mapped[str | None] = mapped_column(String(100), nullable=True)
    current_status: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="candidate_profile")
    district: Mapped["District | None"] = relationship(
        "District", back_populates="candidate_profiles"
    )
    education_history: Mapped[list["CandidateEducationHistory"]] = relationship(
        "CandidateEducationHistory", back_populates="candidate", cascade="all, delete-orphan"
    )
    career_interests: Mapped[list["CandidateCareerInterest"]] = relationship(
        "CandidateCareerInterest", back_populates="candidate", cascade="all, delete-orphan"
    )
    enrollments: Mapped[list["CourseEnrollment"]] = relationship(
        "CourseEnrollment", back_populates="candidate"
    )

    __table_args__ = (
        Index("ix_candidate_profiles_user_id", "user_id"),
        Index("ix_candidate_profiles_district_id", "district_id"),
    )


class CandidateEducationHistory(Base):
    """
    One candidate → many education records.
    Supports 10th / 12th / graduate history for career guidance.
    """
    __tablename__ = "candidate_education_history"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    candidate_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("candidate_profiles.id", ondelete="CASCADE"),
        nullable=False,
    )
    education_level: Mapped[str] = mapped_column(String(50), nullable=False)
    stream_specialization: Mapped[str | None] = mapped_column(String(100), nullable=True)
    institution_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    board_university: Mapped[str | None] = mapped_column(String(255), nullable=True)
    passing_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    marks_percentage: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Relationships
    candidate: Mapped["CandidateProfile"] = relationship(
        "CandidateProfile", back_populates="education_history"
    )

    __table_args__ = (
        Index("ix_candidate_education_history_candidate_id", "candidate_id"),
    )


class CandidateCareerInterest(Base):
    """
    One candidate → many career interests (ranked).
    Feeds into the recommendation engine.
    """
    __tablename__ = "candidate_career_interests"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    candidate_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("candidate_profiles.id", ondelete="CASCADE"),
        nullable=False,
    )
    target_job_role_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("job_roles.id", ondelete="CASCADE"),
        nullable=False,
    )
    preference_rank: Mapped[int | None] = mapped_column(Integer, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    candidate: Mapped["CandidateProfile"] = relationship(
        "CandidateProfile", back_populates="career_interests"
    )
    job_role: Mapped["JobRole"] = relationship(
        "JobRole", back_populates="candidate_interests"
    )

    __table_args__ = (
        Index("ix_candidate_career_interests_candidate_id", "candidate_id"),
        Index("ix_candidate_career_interests_job_role_id", "target_job_role_id"),
    )
