"""
Future Demand Forecasting Service.

Generates evidence-based future demand forecasts using existing SkillMitra data.
Uses historical demand trends, job posting signals, and district-level indicators.
"""

from collections import defaultdict
from datetime import date, datetime, timedelta
import uuid
from typing import Dict, List, Optional, Tuple
from sqlalchemy import func, select, and_, or_
from sqlalchemy.orm import Session

from app.models.demand import IndustryDemand, DemandSignal
from app.models.market import JobPosting
from app.models.demand import FutureDemandForecast
from app.models.career import JobRoleSkill
from app.models.skills import SkillProficiencyLevel


class FutureDemandService:
    """
    Service for generating evidence-based future demand forecasts.
    
    Uses existing SkillMitra data sources:
    - IndustryDemand: Historical demand scores and periods
    - DemandSignal: Real-time demand signals from job postings
    - JobPosting: Current job market activity
    - JobRoleSkill: Canonical skill requirements
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.algorithm_version = "v1.0"
    
    def generate_forecasts(
        self,
        forecast_horizon_months: int = 12,
        regenerate_existing: bool = False,
        max_combinations: int = None
    ) -> List[Dict]:
        """
        Generate future demand forecasts for all district-skill-role combinations.
        
        Args:
            forecast_horizon_months: Months to forecast into the future (default: 12)
            regenerate_existing: Whether to update existing forecasts or skip them
            max_combinations: Maximum number of combinations to process (for testing)
        
        Returns:
            List of generated forecast records
        """
        # Calculate forecast horizon dates
        forecast_start = date.today()
        forecast_end = forecast_start + timedelta(days=forecast_horizon_months * 30)
        
        # Get all unique district-skill-role combinations from current demand
        combinations = self._get_demand_combinations()
        
        if max_combinations:
            combinations = combinations[:max_combinations]
        
        demand_records = self.db.scalars(select(IndustryDemand)).all()
        demand_by_key = defaultdict(list)
        for record in demand_records:
            key = (record.skill_id, record.job_role_id, record.district_id)
            demand_by_key[key].append(record)

        signal_records = self.db.scalars(select(DemandSignal)).all()
        signals_by_key = defaultdict(list)
        for signal in signal_records:
            signals_by_key[(signal.skill_id, signal.job_role_id, signal.district_id)].append(signal)

        existing_records = self.db.scalars(
            select(FutureDemandForecast).where(
                FutureDemandForecast.forecast_horizon_start == forecast_start,
                FutureDemandForecast.forecast_horizon_end == forecast_end,
            )
        ).all()
        existing_by_key = {
            (record.skill_id, record.job_role_id, record.district_id): record
            for record in existing_records
        }

        generated_forecasts = []
        forecast_records = []
        updated_count = 0
        skipped_count = 0
        for combo in combinations:
            forecast = self._generate_single_forecast(
                combo,
                forecast_start,
                forecast_end,
                forecast_horizon_months,
                demand_by_key,
                signals_by_key,
            )

            if not forecast:
                skipped_count += 1
                continue
            key = (combo["skill_id"], combo["job_role_id"], combo["district_id"])
            existing = existing_by_key.get(key)
            if existing:
                if not regenerate_existing:
                    skipped_count += 1
                    continue
                for field, value in forecast.items():
                    setattr(existing, field, value)
                updated_count += 1
            else:
                forecast_records.append(self._create_forecast_record(forecast))
            generated_forecasts.append(forecast)

        if forecast_records:
            self.db.bulk_save_objects(forecast_records)
        self.db.commit()

        return {
            "forecasts": generated_forecasts,
            "generated": len(forecast_records),
            "updated": updated_count,
            "insufficient_data": skipped_count,
            "processed": len(combinations),
        }
    
    def _get_demand_combinations(self) -> List[Dict]:
        """Get unique district-skill-role combinations from current demand data."""
        stmt = select(
            IndustryDemand.skill_id,
            IndustryDemand.job_role_id,
            IndustryDemand.district_id,
            IndustryDemand.industry_sector_id,
            IndustryDemand.proficiency_level_id
        ).distinct()
        
        results = self.db.execute(stmt).all()
        
        return [
            {
                "skill_id": row.skill_id,
                "job_role_id": row.job_role_id,
                "district_id": row.district_id,
                "industry_sector_id": row.industry_sector_id,
                "proficiency_level_id": row.proficiency_level_id,
            }
            for row in results
        ]
    
    def _get_existing_forecast(
        self,
        skill_id: uuid.UUID,
        job_role_id: Optional[uuid.UUID],
        district_id: uuid.UUID,
        forecast_start: date,
        forecast_end: date
    ) -> Optional[FutureDemandForecast]:
        """Check if a forecast already exists for this combination."""
        stmt = select(FutureDemandForecast).where(
            and_(
                FutureDemandForecast.skill_id == skill_id,
                FutureDemandForecast.district_id == district_id,
                FutureDemandForecast.forecast_horizon_start == forecast_start,
                FutureDemandForecast.forecast_horizon_end == forecast_end
            )
        )
        
        if job_role_id:
            stmt = stmt.where(FutureDemandForecast.job_role_id == job_role_id)
        else:
            stmt = stmt.where(FutureDemandForecast.job_role_id.is_(None))
        
        return self.db.scalar(stmt)
    
    def _generate_single_forecast(
        self,
        combo: Dict,
        forecast_start: date,
        forecast_end: date,
        forecast_horizon_months: int,
        demand_by_key: Dict[Tuple, List[IndustryDemand]],
        signals_by_key: Dict[Tuple, List[DemandSignal]],
    ) -> Optional[Dict]:
        """Generate a single forecast for a district-skill-role combination (optimized)."""
        
        # 1. Get current demand evidence (simplified)
        key = (combo["skill_id"], combo["job_role_id"], combo["district_id"])
        records = demand_by_key.get(key, [])
        recent_cutoff = forecast_start - timedelta(days=180)
        recent_records = [record for record in records if record.period_end >= recent_cutoff]
        current_records = recent_records or records[-1:]
        current_demand = self._summarize_demand(current_records)
        
        if not current_demand:
            return None
        
        # Compare the recent and prior six-month averages using loaded records.
        prior_records = [record for record in records if record.period_end < recent_cutoff]
        recent_average = current_demand["score"]
        prior_average = sum(record.aggregate_demand_score for record in prior_records) / len(prior_records) if prior_records else recent_average
        trend_score = (recent_average - prior_average) / max(abs(prior_average), 1.0)
        growth_indicator = "increasing" if trend_score > 0.05 else "decreasing" if trend_score < -0.05 else "stable"
        
        # 3. Simplified signal analysis (skip job posting analysis for speed)
        signal_score = sum(signal.scaled_weight for signal in signals_by_key.get(key, []))
        
        # 4. Calculate forecast score (simplified)
        normalized_demand = min(current_demand["score"] / 100, 1.0)
        signal_boost = min(signal_score / 100, 0.2)
        forecast_score = min(max(normalized_demand * 0.6 + trend_score * 0.2 + signal_boost, 0.0), 1.0)
        
        # 5. Determine forecast level
        forecast_level = self._determine_forecast_level(forecast_score)
        
        # 6. Simplified confidence calculation
        data_points = current_demand["data_points"]
        if data_points >= 5:
            confidence_level = "medium"
            confidence_score = 0.6
        elif data_points >= 1:
            confidence_level = "low"
            confidence_score = 0.3
        else:
            confidence_level = "insufficient"
            confidence_score = 0.1
        
        # 7. Simplified evidence summary
        evidence_summary = f"Current demand level: {current_demand['level']} (score: {current_demand['score']:.1f}); six-month trend: {growth_indicator}; demand signals: {len(signals_by_key.get(key, []))}. Forecast: {forecast_level.replace('_', ' ').title()}. Confidence: {confidence_level.title()}."
        
        return {
            "skill_id": combo["skill_id"],
            "job_role_id": combo["job_role_id"],
            "industry_sector_id": combo["industry_sector_id"],
            "district_id": combo["district_id"],
            "proficiency_level_id": combo["proficiency_level_id"],
            "current_demand_score": current_demand["score"],
            "current_demand_level": current_demand["level"],
            "trend_score": trend_score,
            "growth_indicator": growth_indicator,
            "forecast_level": forecast_level,
            "confidence_score": confidence_score,
            "confidence_level": confidence_level,
            "forecast_horizon_months": forecast_horizon_months,
            "forecast_horizon_start": forecast_start,
            "forecast_horizon_end": forecast_end,
            "evidence_summary": evidence_summary,
            "algorithm_version": self.algorithm_version,
            "data_points_used": data_points,
        }
    
    def _get_current_demand(
        self,
        skill_id: uuid.UUID,
        job_role_id: Optional[uuid.UUID],
        district_id: uuid.UUID
    ) -> Optional[Dict]:
        """Get current demand evidence from IndustryDemand table."""
        
        # First try to get demand for the last 6 months
        six_months_ago = date.today() - timedelta(days=180)
        
        stmt = select(IndustryDemand).where(
            and_(
                IndustryDemand.skill_id == skill_id,
                IndustryDemand.district_id == district_id,
                IndustryDemand.period_end >= six_months_ago
            )
        )
        
        if job_role_id:
            stmt = stmt.where(IndustryDemand.job_role_id == job_role_id)
        
        demand_records = self.db.scalars(stmt).all()
        
        # If no recent records, try to get any available records for this combination
        if not demand_records:
            stmt = select(IndustryDemand).where(
                and_(
                    IndustryDemand.skill_id == skill_id,
                    IndustryDemand.district_id == district_id
                )
            ).order_by(IndustryDemand.period_end.desc()).limit(1)
            
            if job_role_id:
                stmt = stmt.where(IndustryDemand.job_role_id == job_role_id)
            
            demand_records = self.db.scalars(stmt).all()
        
        if not demand_records:
            return None
        
        # Calculate aggregate current demand
        total_score = sum(record.aggregate_demand_score for record in demand_records)
        avg_score = total_score / len(demand_records)
        
        # Determine demand level
        demand_level = self._score_to_demand_level(avg_score)
        
        return {
            "score": avg_score,
            "level": demand_level,
            "data_points": len(demand_records),
            "records": demand_records
        }

    def _summarize_demand(self, demand_records: List[IndustryDemand]) -> Optional[Dict]:
        if not demand_records:
            return None
        avg_score = sum(record.aggregate_demand_score for record in demand_records) / len(demand_records)
        return {
            "score": avg_score,
            "level": self._score_to_demand_level(avg_score),
            "data_points": len(demand_records),
            "records": demand_records,
        }
    
    def _determine_forecast_level(self, forecast_score: float) -> str:
        """Determine forecast level from forecast score."""
        
        if forecast_score >= 0.8:
            return "very_high"
        elif forecast_score >= 0.6:
            return "high"
        elif forecast_score >= 0.3:
            return "growing"
        elif forecast_score >= 0.1:
            return "stable"
        elif forecast_score >= -0.1:
            return "declining"
        else:
            return "insufficient_data"
    
    def _score_to_demand_level(self, score: float) -> str:
        """Convert demand score to demand level."""
        
        if score >= 80:
            return "very_high"
        elif score >= 60:
            return "high"
        elif score >= 40:
            return "medium"
        elif score >= 0:
            return "low"
        else:
            return "insufficient_data"
    
    def _create_forecast_record(self, forecast: Dict) -> FutureDemandForecast:
        """Create a FutureDemandForecast record from forecast data."""
        
        return FutureDemandForecast(
            skill_id=forecast["skill_id"],
            job_role_id=forecast["job_role_id"],
            industry_sector_id=forecast["industry_sector_id"],
            district_id=forecast["district_id"],
            proficiency_level_id=forecast["proficiency_level_id"],
            current_demand_score=forecast["current_demand_score"],
            current_demand_level=forecast["current_demand_level"],
            trend_score=forecast["trend_score"],
            growth_indicator=forecast["growth_indicator"],
            forecast_level=forecast["forecast_level"],
            confidence_score=forecast["confidence_score"],
            confidence_level=forecast["confidence_level"],
            forecast_horizon_months=forecast["forecast_horizon_months"],
            forecast_horizon_start=forecast["forecast_horizon_start"],
            forecast_horizon_end=forecast["forecast_horizon_end"],
            evidence_summary=forecast["evidence_summary"],
            algorithm_version=forecast["algorithm_version"],
            data_points_used=forecast["data_points_used"],
        )
    
    def get_forecasts(
        self,
        district_id: Optional[uuid.UUID] = None,
        skill_id: Optional[uuid.UUID] = None,
        job_role_id: Optional[uuid.UUID] = None,
        forecast_level: Optional[str] = None,
        limit: int = 100
    ) -> List[FutureDemandForecast]:
        """Get forecasts with optional filters."""
        
        stmt = select(FutureDemandForecast).order_by(
            FutureDemandForecast.confidence_score.desc(),
            FutureDemandForecast.forecast_level.desc()
        )
        
        if district_id:
            stmt = stmt.where(FutureDemandForecast.district_id == district_id)
        
        if skill_id:
            stmt = stmt.where(FutureDemandForecast.skill_id == skill_id)
        
        if job_role_id:
            stmt = stmt.where(FutureDemandForecast.job_role_id == job_role_id)
        
        if forecast_level:
            stmt = stmt.where(FutureDemandForecast.forecast_level == forecast_level)
        
        stmt = stmt.limit(limit)
        
        return self.db.scalars(stmt).all()