"""
Future Demand Forecasting models:
- future_demand_forecasts

Phase 5 scope.
"""

import uuid
from datetime import date, datetime

from sqlalchemy import (
    Boolean, CheckConstraint, Date, DateTime,
    ForeignKey, Float, Integer, String, Text, Index, UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class FutureDemandForecast(TimestampMixin, Base):
    """
    Future demand forecasts based on historical demand analysis and trend signals.
    Uses existing SkillMitra data to generate explainable forecasts.
    """
    __tablename__ = "future_demand_forecasts"

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
    
    # Current demand evidence
    current_demand_score: Mapped[float] = mapped_column(Float, nullable=False)
    current_demand_level: Mapped[str] = mapped_column(String(20), nullable=False)
    
    # Forecast calculations
    trend_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    growth_indicator: Mapped[str] = mapped_column(String(20), nullable=False)
    
    # Forecast output
    forecast_level: Mapped[str] = mapped_column(String(20), nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, nullable=False)
    confidence_level: Mapped[str] = mapped_column(String(20), nullable=False)
    
    # Forecast metadata
    forecast_horizon_months: Mapped[int] = mapped_column(Integer, nullable=False, default=12)
    forecast_horizon_start: Mapped[date] = mapped_column(Date, nullable=False)
    forecast_horizon_end: Mapped[date] = mapped_column(Date, nullable=False)
    
    # Evidence and explainability
    evidence_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    algorithm_version: Mapped[str] = mapped_column(String(50), nullable=False, default="v1.0")
    data_points_used: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    
    # Relationships
    skill: Mapped["Skill"] = relationship("Skill")
    job_role: Mapped["JobRole | None"] = relationship("JobRole")
    industry_sector: Mapped["IndustrySector"] = relationship("IndustrySector")
    district: Mapped["District"] = relationship("District")
    proficiency_level: Mapped["SkillProficiencyLevel"] = relationship("SkillProficiencyLevel")

    __table_args__ = (
        CheckConstraint(
            "forecast_level IN ('very_high', 'high', 'growing', 'stable', 'declining', 'insufficient_data')",
            name="ck_forecast_level",
        ),
        CheckConstraint(
            "confidence_level IN ('high', 'medium', 'low', 'insufficient')",
            name="ck_confidence_level",
        ),
        CheckConstraint(
            "growth_indicator IN ('increasing', 'decreasing', 'stable', 'unknown')",
            name="ck_growth_indicator",
        ),
        CheckConstraint(
            "current_demand_level IN ('very_high', 'high', 'medium', 'low', 'insufficient_data')",
            name="ck_current_demand_level",
        ),
        UniqueConstraint(
            "skill_id", "job_role_id", "district_id", "forecast_horizon_start", "forecast_horizon_end",
            name="uq_forecast_unique_key",
        ),
        Index("ix_future_demand_skill_id", "skill_id"),
        Index("ix_future_demand_job_role_id", "job_role_id"),
        Index("ix_future_demand_district_id", "district_id"),
        Index("ix_future_demand_forecast_level", "forecast_level"),
        Index("ix_future_demand_confidence_level", "confidence_level"),
    )