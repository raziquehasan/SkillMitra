"""
Phase 8 models — SIH PS gap-fill (MINIMAL additions, no duplicates):

- government_officials   : role-specific profile + approval workflow
                           (PENDING_VERIFICATION -> APPROVED). Public
                           self-registration allowed but dashboard access
                           is granted only after admin approval.
- emerging_technologies  : emerging tech trend signals (STEP 6 of PS audit)
- technology_skills      : technology <-> skill mapping
- course_health_scores   : course relevance/obsolescence scoring with
                           mandatory HUMAN REVIEW before any status change
                           (STEP 7 of PS audit)

All tables follow existing conventions: UUID PKs, TimestampMixin,
varchar CHECK constraints, FKs to existing tables. No existing table
is recreated or renamed.
"""
import uuid
from datetime import date, datetime

from sqlalchemy import (
    CheckConstraint, Date, DateTime, ForeignKey, Index, Integer,
    JSON, String, Text, UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class GovernmentOfficial(TimestampMixin, Base):
    """
    Government-official specific profile (1:1 with users).

    Approval workflow (enforced in service layer):
        registration -> verification_status = 'pending_verification'
        admin review -> 'approved' (role government_admin assigned then)
                     -> 'rejected'
    The government_admin ROLE is NOT assigned at registration time;
    dashboard access (require_roles('government_admin')) therefore
    only works after approval.
    """
    __tablename__ = "government_officials"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    district_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("districts.id", ondelete="SET NULL"),
        nullable=True,
    )
    department: Mapped[str] = mapped_column(String(255), nullable=False)
    designation: Mapped[str] = mapped_column(String(255), nullable=False)
    employee_code: Mapped[str | None] = mapped_column(String(100), nullable=True)
    verification_status: Mapped[str] = mapped_column(
        String(30), nullable=False, default="pending_verification"
    )
    submitted_documents: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    reviewed_by_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    reviewed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    review_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    __table_args__ = (
        CheckConstraint(
            "verification_status IN ('pending_verification', 'approved', 'rejected')",
            name="ck_gov_officials_verification_status",
        ),
        Index("ix_gov_officials_user_id", "user_id"),
        Index("ix_gov_officials_district_id", "district_id"),
        Index("ix_gov_officials_verification_status", "verification_status"),
    )


class EmergingTechnology(TimestampMixin, Base):
    """
    Emerging-technology trend observation (PS: 'emerging technology trends').

    One row = one observation of a technology trend for a sector
    (and optionally a district) over an observation period, with a
    trend direction, growth indicator, confidence and provenance.
    """
    __tablename__ = "emerging_technologies"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    technology_name: Mapped[str] = mapped_column(String(200), nullable=False)
    industry_sector_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("industry_sectors.id", ondelete="SET NULL"),
        nullable=True,
    )
    district_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("districts.id", ondelete="SET NULL"),
        nullable=True,
    )
    trend_direction: Mapped[str] = mapped_column(String(20), nullable=False)
    growth_indicator: Mapped[float | None] = mapped_column(nullable=True)
    observation_start: Mapped[date | None] = mapped_column(Date, nullable=True)
    observation_end: Mapped[date | None] = mapped_column(Date, nullable=True)
    confidence: Mapped[str] = mapped_column(String(20), nullable=False, default="medium")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    data_source_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("data_sources.id", ondelete="SET NULL"),
        nullable=True,
    )

    __table_args__ = (
        CheckConstraint(
            "trend_direction IN ('emerging', 'rising', 'stable', 'declining', 'obsolete')",
            name="ck_emerging_tech_trend_direction",
        ),
        CheckConstraint(
            "confidence IN ('low', 'medium', 'high')",
            name="ck_emerging_tech_confidence",
        ),
        CheckConstraint(
            "observation_start IS NULL OR observation_end IS NULL OR observation_start <= observation_end",
            name="ck_emerging_tech_period",
        ),
        UniqueConstraint(
            "technology_name", "industry_sector_id", "district_id",
            "observation_start", "observation_end",
            name="uq_emerging_tech_observation",
        ),
        Index("ix_emerging_tech_sector_id", "industry_sector_id"),
        Index("ix_emerging_tech_district_id", "district_id"),
        Index("ix_emerging_tech_trend_direction", "trend_direction"),
    )


class TechnologySkill(Base):
    """Junction: emerging_technologies <-> skills."""
    __tablename__ = "technology_skills"

    technology_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("emerging_technologies.id", ondelete="CASCADE"),
        primary_key=True,
    )
    skill_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("skills.id", ondelete="CASCADE"),
        primary_key=True,
    )
    relevance: Mapped[str] = mapped_column(
        String(20), nullable=False, default="core"
    )

    __table_args__ = (
        CheckConstraint(
            "relevance IN ('core', 'supporting', 'adjacent')",
            name="ck_technology_skills_relevance",
        ),
        Index("ix_technology_skills_skill_id", "skill_id"),
    )


class CourseHealthScore(TimestampMixin, Base):
    """
    Course relevance / obsolescence scoring (PS: flag obsolete or
    oversupplied courses).

    IMPORTANT POLICY (enforced by CHECK + service layer):
    - system may only RECOMMEND a status;
    - a human must review before any decision is final;
    - this table NEVER deletes or archives a course by itself.
    courses.status remains the single source of truth for delivery.
    """
    __tablename__ = "course_health_scores"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
    )
    # Component scores (0..100)
    industry_demand_score: Mapped[float | None] = mapped_column(nullable=True)
    placement_score: Mapped[float | None] = mapped_column(nullable=True)
    employer_validation_score: Mapped[float | None] = mapped_column(nullable=True)
    curriculum_alignment_score: Mapped[float | None] = mapped_column(nullable=True)
    future_trend_score: Mapped[float | None] = mapped_column(nullable=True)
    supply_demand_score: Mapped[float | None] = mapped_column(nullable=True)
    overall_score: Mapped[float | None] = mapped_column(nullable=True)
    # System recommendation (AI/analytics output only)
    recommended_status: Mapped[str] = mapped_column(String(30), nullable=False)
    # Human review workflow
    review_status: Mapped[str] = mapped_column(
        String(30), nullable=False, default="pending_review"
    )
    reviewed_by_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    reviewed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    review_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    final_status: Mapped[str | None] = mapped_column(String(30), nullable=True)
    # Scoring window + provenance
    period_start: Mapped[date | None] = mapped_column(Date, nullable=True)
    period_end: Mapped[date | None] = mapped_column(Date, nullable=True)
    score_details: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    __table_args__ = (
        CheckConstraint(
            "recommended_status IN ('relevant', 'needs_update', 'oversupplied', 'low_demand', 'obsolete_review')",
            name="ck_course_health_recommended_status",
        ),
        CheckConstraint(
            "review_status IN ('pending_review', 'under_review', 'reviewed')",
            name="ck_course_health_review_status",
        ),
        CheckConstraint(
            "final_status IS NULL OR final_status IN ('relevant', 'needs_update', 'oversupplied', 'low_demand', 'obsolete_review', 'dismissed')",
            name="ck_course_health_final_status",
        ),
        CheckConstraint(
            "overall_score IS NULL OR (overall_score >= 0 AND overall_score <= 100)",
            name="ck_course_health_overall_range",
        ),
        UniqueConstraint("course_id", "period_start", "period_end", name="uq_course_health_period"),
        Index("ix_course_health_course_id", "course_id"),
        Index("ix_course_health_review_status", "review_status"),
        Index("ix_course_health_recommended_status", "recommended_status"),
    )