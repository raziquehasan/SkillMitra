"""
Identity models: users, candidate_profiles,
candidate_education_history, candidate_career_interests, candidate_resumes.

Phase 2A scope.
Phase 1 source: docs/database/ENTITY_DICTIONARY.md §1

NOTE: roles / user_roles are intentionally EXCLUDED from Phase 2A.
      Do NOT add a role column to users as a shortcut.
"""

import uuid
from datetime import date, datetime, timezone

from sqlalchemy import (
    Boolean, CheckConstraint, Date, DateTime, Float, ForeignKey,
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
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    reset_token: Mapped[str | None] = mapped_column(String(255), nullable=True)
    reset_token_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    candidate_profile: Mapped["CandidateProfile | None"] = relationship(
        "CandidateProfile", back_populates="user", uselist=False
    )
    employer_profile: Mapped["Employer | None"] = relationship(
        "Employer", back_populates="user", uselist=False
    )
    government_official: Mapped["GovernmentOfficial | None"] = relationship(
        "GovernmentOfficial",
        back_populates="user",
        uselist=False,
        foreign_keys="[GovernmentOfficial.user_id]",
    )
    reviewed_government_officials: Mapped[list["GovernmentOfficial"]] = relationship(
        "GovernmentOfficial",
        back_populates="reviewed_by_user",
        foreign_keys="[GovernmentOfficial.reviewed_by_user_id]",
    )
    user_roles: Mapped[list["UserRole"]] = relationship(
        "UserRole", back_populates="user", cascade="all, delete-orphan"
    )
    refresh_tokens: Mapped[list["RefreshToken"]] = relationship(
        "RefreshToken", back_populates="user", cascade="all, delete-orphan"
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
    gender: Mapped[str | None] = mapped_column(String(20), nullable=True)
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
    resumes: Mapped[list["CandidateResume"]] = relationship(
        "CandidateResume", back_populates="candidate", cascade="all, delete-orphan"
    )
    enrollments: Mapped[list["CourseEnrollment"]] = relationship(
        "CourseEnrollment", back_populates="candidate"
    )
    applications: Mapped[list["Application"]] = relationship(
        "Application", back_populates="candidate"
    )
    placements: Mapped[list["Placement"]] = relationship(
        "Placement", back_populates="candidate"
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


class CandidateResume(Base):
    """
    One candidate → many resume uploads.
    Supports resume-based skill extraction and profile building.
    """
    __tablename__ = "candidate_resumes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    candidate_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("candidate_profiles.id", ondelete="CASCADE"),
        nullable=False,
    )
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_type: Mapped[str] = mapped_column(String(50), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)
    file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    processing_status: Mapped[str] = mapped_column(
        String(50), nullable=False, default="pending"
    )
    extracted_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    processing_error: Mapped[str | None] = mapped_column(Text, nullable=True)
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    processed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    candidate: Mapped["CandidateProfile"] = relationship(
        "CandidateProfile", back_populates="resumes"
    )

    __table_args__ = (
        CheckConstraint(
            "processing_status IN ('pending', 'processing', 'completed', 'failed')",
            name="ck_resume_processing_status"
        ),
        CheckConstraint("file_size >= 0", name="ck_resume_file_size_positive"),
        Index("ix_candidate_resumes_candidate_id", "candidate_id"),
    )

class Employer(TimestampMixin, Base):
    __tablename__ = "employers"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    industry_sector_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("industry_sectors.id", ondelete="RESTRICT"), nullable=False
    )
    district_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("districts.id", ondelete="SET NULL"),
        nullable=True,
    )
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_person: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    organization_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    website: Mapped[str | None] = mapped_column(String(255), nullable=True)
    size_category: Mapped[str | None] = mapped_column(String(50), nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="employer_profile")
    district: Mapped["District | None"] = relationship("District")
    industry_sector: Mapped["IndustrySector"] = relationship("IndustrySector", back_populates="employers")
    job_postings: Mapped[list["JobPosting"]] = relationship(
        "JobPosting", back_populates="employer"
    )

    __table_args__ = (
        Index("ix_employers_user_id", "user_id"),
        Index("ix_employers_district_id", "district_id"),
    )
