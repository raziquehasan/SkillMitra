"""
Job Market & Applications models:
- job_postings
- job_posting_skills
- applications
- placements

Phase 2B scope.
Phase 1 source: docs/database/ENTITY_DICTIONARY.md §5 & §12
"""

import uuid
from datetime import date, datetime

from sqlalchemy import (
    Boolean, CheckConstraint, Date, DateTime,
    ForeignKey, Integer, String, Text, Index, UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class JobPosting(TimestampMixin, Base):
    """
    Individual job listings.
    data_source_id is now populated.
    """
    __tablename__ = "job_postings"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    employer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("employers.id", ondelete="CASCADE"),
        nullable=False,
    )
    job_role_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("job_roles.id", ondelete="RESTRICT"),
        nullable=False,
    )
    district_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("districts.id", ondelete="SET NULL"),
        nullable=True,
    )
    data_source_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("data_sources.id", ondelete="RESTRICT"),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="open")
    posted_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    closed_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    experience_min: Mapped[str | None] = mapped_column(String(20), nullable=True)
    experience_max: Mapped[str | None] = mapped_column(String(20), nullable=True)
    job_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    employer_careers_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    employer: Mapped["Employer"] = relationship("Employer", back_populates="job_postings")
    job_role: Mapped["JobRole"] = relationship("JobRole", back_populates="job_postings")
    district: Mapped["District | None"] = relationship("District")
    data_source: Mapped["DataSource"] = relationship("DataSource", back_populates="job_postings")
    demand_signals: Mapped[list["DemandSignal"]] = relationship("DemandSignal", back_populates="job_posting", cascade="all, delete-orphan")
    job_posting_skills: Mapped[list["JobPostingSkill"]] = relationship(
        "JobPostingSkill", back_populates="job_posting", cascade="all, delete-orphan"
    )
    applications: Mapped[list["Application"]] = relationship(
        "Application", back_populates="job_posting"
    )
    placements: Mapped[list["Placement"]] = relationship(
        "Placement", back_populates="job_posting"
    )

    __table_args__ = (
        Index("ix_job_postings_employer_id", "employer_id"),
        Index("ix_job_postings_job_role_id", "job_role_id"),
        Index("ix_job_postings_district_id", "district_id"),
        Index("ix_job_postings_status", "status"),
    )


class JobPostingSkill(Base):
    """
    Junction: job_postings <-> skills.
    """
    __tablename__ = "job_posting_skills"

    job_posting_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("job_postings.id", ondelete="CASCADE"),
        primary_key=True,
    )
    skill_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("skills.id", ondelete="CASCADE"),
        primary_key=True,
    )
    proficiency_level_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("skill_proficiency_levels.id", ondelete="RESTRICT"),
        nullable=False,
    )
    importance: Mapped[str] = mapped_column(String(20), nullable=False, default="mandatory")
    years_experience: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Relationships
    job_posting: Mapped["JobPosting"] = relationship("JobPosting", back_populates="job_posting_skills")
    skill: Mapped["Skill"] = relationship("Skill")
    proficiency_level: Mapped["SkillProficiencyLevel"] = relationship("SkillProficiencyLevel")

    __table_args__ = (
        CheckConstraint(
            "importance IN ('mandatory', 'preferred', 'nice_to_have')",
            name="ck_job_posting_skills_importance",
        ),
        Index("ix_job_posting_skills_skill_id", "skill_id"),
    )


class Application(TimestampMixin, Base):
    """
    Job applications submitted by candidates.
    """
    __tablename__ = "applications"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    candidate_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("candidate_profiles.id", ondelete="CASCADE"),
        nullable=False,
    )
    job_posting_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("job_postings.id", ondelete="CASCADE"),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="applied")
    applied_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    # Using TimestampMixin also provides created_at and updated_at

    # Relationships
    candidate: Mapped["CandidateProfile"] = relationship("CandidateProfile", back_populates="applications")
    job_posting: Mapped["JobPosting"] = relationship("JobPosting", back_populates="applications")
    placement: Mapped["Placement | None"] = relationship(
        "Placement", back_populates="application", uselist=False
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('applied', 'screening', 'interviewing', 'offered', 'rejected')",
            name="ck_applications_status",
        ),
        Index("ix_applications_candidate_id", "candidate_id"),
        Index("ix_applications_job_posting_id", "job_posting_id"),
        Index("ix_applications_status", "status"),
    )


class Placement(TimestampMixin, Base):
    """
    Placement Outcomes.
    """
    __tablename__ = "placements"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    candidate_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("candidate_profiles.id", ondelete="CASCADE"),
        nullable=False,
    )
    employer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("employers.id", ondelete="RESTRICT"),
        nullable=False,
    )
    job_role_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("job_roles.id", ondelete="RESTRICT"),
        nullable=False,
    )
    enrollment_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("course_enrollments.id", ondelete="SET NULL"),
        nullable=True,
        unique=True, # 1:0..1 cardinality
    )
    job_posting_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("job_postings.id", ondelete="SET NULL"),
        nullable=True,
    )
    application_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("applications.id", ondelete="SET NULL"),
        nullable=True,
        unique=True, # 1:0..1 cardinality
    )
    district_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("districts.id", ondelete="SET NULL"),
        nullable=True,
    )
    placement_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    outcome_status: Mapped[str] = mapped_column(String(50), nullable=False)
    salary_range: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Relationships
    candidate: Mapped["CandidateProfile"] = relationship("CandidateProfile", back_populates="placements")
    employer: Mapped["Employer"] = relationship("Employer")
    job_role: Mapped["JobRole"] = relationship("JobRole")
    enrollment: Mapped["CourseEnrollment"] = relationship("CourseEnrollment", back_populates="placement")
    job_posting: Mapped["JobPosting"] = relationship("JobPosting", back_populates="placements")
    application: Mapped["Application"] = relationship("Application", back_populates="placement")
    district: Mapped["District | None"] = relationship("District")

    __table_args__ = (
        CheckConstraint(
            "outcome_status IN ('placed_full_time', 'placed_part_time', 'self_employed', 'apprenticeship')",
            name="ck_placements_outcome_status",
        ),
        Index("ix_placements_candidate_id", "candidate_id"),
        Index("ix_placements_employer_id", "employer_id"),
        Index("ix_placements_district_id", "district_id"),
    )
