"""
Demand, Data Sources, and Industry models:
- industry_sectors
- data_sources
- employer_surveys
- employer_survey_responses
- demand_signals
- industry_demand

Phase 2C scope.
"""

import uuid
from datetime import date, datetime

from sqlalchemy import (
    Boolean, CheckConstraint, Date, DateTime, Float,
    ForeignKey, Integer, String, Text, Index, UniqueConstraint, text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class IndustrySector(Base):
    __tablename__ = "industry_sectors"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    code: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    employers: Mapped[list["Employer"]] = relationship("Employer", back_populates="industry_sector")
    industry_demands: Mapped[list["IndustryDemand"]] = relationship("IndustryDemand", back_populates="industry_sector")


class DataSource(TimestampMixin, Base):
    __tablename__ = "data_sources"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    source_category: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    organization: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active", server_default=text("'active'"))

    # Relationships
    job_postings: Mapped[list["JobPosting"]] = relationship("JobPosting", back_populates="data_source")


class EmployerSurvey(TimestampMixin, Base):
    __tablename__ = "employer_surveys"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="active")
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    # Relationships
    responses: Mapped[list["EmployerSurveyResponse"]] = relationship("EmployerSurveyResponse", back_populates="survey")


class EmployerSurveyResponse(TimestampMixin, Base):
    __tablename__ = "employer_survey_responses"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    survey_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employer_surveys.id", ondelete="CASCADE"), nullable=False
    )
    employer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employers.id", ondelete="CASCADE"), nullable=False
    )

    # Relationships
    survey: Mapped["EmployerSurvey"] = relationship("EmployerSurvey", back_populates="responses")
    employer: Mapped["Employer"] = relationship("Employer")
    demand_signals: Mapped[list["DemandSignal"]] = relationship("DemandSignal", back_populates="survey_response")


class DemandSignal(TimestampMixin, Base):
    __tablename__ = "demand_signals"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    skill_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False
    )
    job_role_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("job_roles.id", ondelete="CASCADE"), nullable=True
    )
    district_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("districts.id", ondelete="CASCADE"), nullable=False
    )
    job_posting_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("job_postings.id", ondelete="CASCADE"), nullable=True
    )
    survey_response_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employer_survey_responses.id", ondelete="CASCADE"), nullable=True
    )
    raw_weight: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    scaled_weight: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    detected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    # Relationships
    skill: Mapped["Skill"] = relationship("Skill")
    job_role: Mapped["JobRole | None"] = relationship("JobRole")
    district: Mapped["District"] = relationship("District")
    job_posting: Mapped["JobPosting | None"] = relationship("JobPosting", back_populates="demand_signals")
    survey_response: Mapped["EmployerSurveyResponse | None"] = relationship("EmployerSurveyResponse", back_populates="demand_signals")

    __table_args__ = (
        CheckConstraint(
            "(job_posting_id IS NOT NULL AND survey_response_id IS NULL) OR (job_posting_id IS NULL AND survey_response_id IS NOT NULL)",
            name="ck_demand_signals_exclusive_source",
        ),
        Index("ix_demand_signals_skill_id", "skill_id"),
        Index("ix_demand_signals_job_role_id", "job_role_id"),
        Index("ix_demand_signals_district_id", "district_id"),
    )


class IndustryDemand(TimestampMixin, Base):
    __tablename__ = "industry_demand"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    skill_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False
    )
    job_role_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("job_roles.id", ondelete="CASCADE"), nullable=True
    )
    industry_sector_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("industry_sectors.id", ondelete="CASCADE"), nullable=False
    )
    district_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("districts.id", ondelete="CASCADE"), nullable=False
    )
    proficiency_level_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("skill_proficiency_levels.id", ondelete="CASCADE"), nullable=False
    )
    data_source_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("data_sources.id", ondelete="SET NULL"), nullable=True
    )
    aggregate_demand_score: Mapped[float] = mapped_column(Float, nullable=False)
    period_start: Mapped[date] = mapped_column(Date, nullable=False)
    period_end: Mapped[date] = mapped_column(Date, nullable=False)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    # Relationships
    skill: Mapped["Skill"] = relationship("Skill")
    job_role: Mapped["JobRole | None"] = relationship("JobRole")
    industry_sector: Mapped["IndustrySector"] = relationship("IndustrySector", back_populates="industry_demands")
    district: Mapped["District"] = relationship("District")
    proficiency_level: Mapped["SkillProficiencyLevel"] = relationship("SkillProficiencyLevel")
    data_source: Mapped["DataSource | None"] = relationship("DataSource")

    __table_args__ = (
        Index("ix_industry_demand_skill_id", "skill_id"),
        Index("ix_industry_demand_job_role_id", "job_role_id"),
        Index("ix_industry_demand_sector_id", "industry_sector_id"),
        Index("ix_industry_demand_district_id", "district_id"),
        Index("ix_industry_demand_data_source_id", "data_source_id"),
    )
