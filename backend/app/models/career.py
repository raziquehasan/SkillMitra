"""
Career & Training models:
- job_roles
- job_role_skills       (canonical job->skill requirements)
- courses
- course_skills
- course_enrollments

Phase 2A scope.
Phase 1 source: docs/database/ENTITY_DICTIONARY.md §5 & §6

NOT in Phase 2A: job_postings, applications, placements,
                 employers, qualifications, training_providers
"""

import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean, CheckConstraint, Date, DateTime,
    ForeignKey, Integer, Numeric, String, Text, Index, UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, utcnow


class JobRole(Base):
    """
    Standardised career role titles.
    industry_sector_id is intentionally absent from Phase 2A;
    industry_sectors table is added in Phase 2B.
    """
    __tablename__ = "job_roles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # Relationships
    job_role_skills: Mapped[list["JobRoleSkill"]] = relationship(
        "JobRoleSkill", back_populates="job_role", cascade="all, delete-orphan"
    )
    candidate_interests: Mapped[list["CandidateCareerInterest"]] = relationship(
        "CandidateCareerInterest", back_populates="job_role"
    )
    job_postings: Mapped[list["JobPosting"]] = relationship(
        "JobPosting", back_populates="job_role"
    )

    __table_args__ = (
        Index("ix_job_roles_is_active", "is_active"),
    )


class JobRoleSkill(Base):
    """
    Junction: job_roles <-> skills  (canonical requirements).

    This is the SOURCE OF TRUTH for what skills a job role requires.
    importance values: mandatory | preferred | nice_to_have
    """
    __tablename__ = "job_role_skills"

    job_role_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("job_roles.id", ondelete="CASCADE"),
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
    importance: Mapped[str] = mapped_column(
        String(20), nullable=False, default="mandatory"
    )
    years_experience_required: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Relationships
    job_role: Mapped["JobRole"] = relationship("JobRole", back_populates="job_role_skills")
    skill: Mapped["Skill"] = relationship("Skill", back_populates="job_role_skills")
    proficiency_level: Mapped["SkillProficiencyLevel"] = relationship(
        "SkillProficiencyLevel", back_populates="job_role_skills"
    )

    __table_args__ = (
        CheckConstraint(
            "importance IN ('mandatory', 'preferred', 'nice_to_have')",
            name="ck_job_role_skills_importance",
        ),
        Index("ix_job_role_skills_skill_id", "skill_id"),
        Index("ix_job_role_skills_proficiency_level_id", "proficiency_level_id"),
    )


class Course(TimestampMixin, Base):
    """
    Training courses offered by training providers.

    provider_id is deferred to Phase 2B (training_providers not in scope).
    district_id is nullable; wired to districts table.
    """
    __tablename__ = "courses"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    district_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("districts.id", ondelete="SET NULL"),
        nullable=True,
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")
    duration_hours: Mapped[int | None] = mapped_column(Integer, nullable=True)
    training_level: Mapped[str | None] = mapped_column(String(50), nullable=True)
    delivery_mode: Mapped[str | None] = mapped_column(String(20), nullable=True)
    source_course_code: Mapped[str | None] = mapped_column(String(100), nullable=True)
    qualification: Mapped[str | None] = mapped_column(Text, nullable=True)
    cost_category: Mapped[str | None] = mapped_column(String(50), nullable=True)
    rate_per_hour: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    nsqf_level: Mapped[int | None] = mapped_column(Integer, nullable=True)
    nqr_code: Mapped[str | None] = mapped_column(String(150), nullable=True)
    source_version: Mapped[str | None] = mapped_column(String(50), nullable=True)
    industry_sector_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("industry_sectors.id", ondelete="RESTRICT"), nullable=True
    )
    data_source_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("data_sources.id", ondelete="RESTRICT"), nullable=True
    )
    ingestion_run_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("data_ingestion_runs.id", ondelete="RESTRICT"), nullable=True
    )
    source_record_identifier: Mapped[str | None] = mapped_column(String(255), nullable=True)
    source_updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    district: Mapped["District | None"] = relationship(
        "District", back_populates="courses"
    )
    course_skills: Mapped[list["CourseSkill"]] = relationship(
        "CourseSkill", back_populates="course", cascade="all, delete-orphan"
    )
    enrollments: Mapped[list["CourseEnrollment"]] = relationship(
        "CourseEnrollment", back_populates="course"
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('active', 'draft', 'archived')",
            name="ck_courses_status",
        ),
        CheckConstraint(
            "delivery_mode IS NULL OR delivery_mode IN ('in_person', 'online', 'hybrid')",
            name="ck_courses_delivery_mode",
        ),
        CheckConstraint("nsqf_level IS NULL OR nsqf_level >= 0", name="ck_courses_nsqf_level_nonnegative"),
        CheckConstraint("rate_per_hour IS NULL OR rate_per_hour >= 0", name="ck_courses_rate_nonnegative"),
        UniqueConstraint("data_source_id", "source_course_code", name="uq_courses_source_course_code"),
        UniqueConstraint("data_source_id", "nqr_code", "source_version", name="uq_courses_source_nqr_version"),
        Index("ix_courses_district_id", "district_id"),
        Index("ix_courses_status", "status"),
        Index("ix_courses_source_course_code", "source_course_code"),
        Index("ix_courses_data_source_id", "data_source_id"),
        Index("ix_courses_ingestion_run_id", "ingestion_run_id"),
    )


class CourseSkill(Base):
    """
    Junction: courses <-> skills.
    Records which skills a course teaches and at what proficiency.
    """
    __tablename__ = "course_skills"

    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("courses.id", ondelete="CASCADE"),
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
    is_primary: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # Relationships
    course: Mapped["Course"] = relationship("Course", back_populates="course_skills")
    skill: Mapped["Skill"] = relationship("Skill", back_populates="course_skills")
    proficiency_level: Mapped["SkillProficiencyLevel"] = relationship(
        "SkillProficiencyLevel", back_populates="course_skills"
    )

    __table_args__ = (
        Index("ix_course_skills_skill_id", "skill_id"),
    )


class CourseEnrollment(Base):
    """
    Tracks candidate training progression and outcome.

    status: enrolled | completed | dropped

    Phase 1 constraint: one enrollment -> 0..1 placement.
    The UNIQUE constraint on placements.enrollment_id enforces this.
    That constraint is added when the placements table is created in Phase 2B.
    """
    __tablename__ = "course_enrollments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    candidate_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("candidate_profiles.id", ondelete="CASCADE"),
        nullable=False,
    )
    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("courses.id", ondelete="RESTRICT"),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="enrolled")
    enrollment_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    completion_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    grade_outcome: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # Relationships
    candidate: Mapped["CandidateProfile"] = relationship(
        "CandidateProfile", back_populates="enrollments"
    )
    course: Mapped["Course"] = relationship("Course", back_populates="enrollments")
    placement: Mapped["Placement | None"] = relationship(
        "Placement", back_populates="enrollment", uselist=False
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('enrolled', 'completed', 'dropped')",
            name="ck_course_enrollments_status",
        ),
        UniqueConstraint(
            "candidate_id", "course_id",
            name="uq_enrollment_candidate_course",
        ),
        Index("ix_course_enrollments_candidate_id", "candidate_id"),
        Index("ix_course_enrollments_course_id", "course_id"),
        Index("ix_course_enrollments_status", "status"),
    )
