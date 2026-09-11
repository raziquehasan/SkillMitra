"""
Future Demand Forecasting Service.

Generates evidence-based future demand forecasts using existing SkillMitra data.
Uses historical demand trends, job posting signals, and district-level indicators.
"""

from datetime import date, datetime, timedelta
from time import perf_counter
import uuid
from typing import Dict, List, Optional, Tuple
from sqlalchemy import func, select, and_, or_
from sqlalchemy.orm import Session

from app.models.demand import IndustryDemand, DemandSignal
from app.models.market import JobPosting
from app.models.future_demand import FutureDemandForecast
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
        self.last_generation_stats = {
            "requested_combinations": None,
            "processed_combinations": 0,
            "generated": 0,
            "updated": 0,
            "insufficient_data": 0,
            "execution_time_seconds": 0.0,
        }
    
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
        started_at = perf_counter()
        forecast_start = date.today()
        forecast_end = forecast_start + timedelta(days=forecast_horizon_months * 30)
        
        # Get all unique district-skill-role combinations from current demand
        combinations = self._get_demand_combinations()
        
        if max_combinations:
            combinations = combinations[:max_combinations]
        
        generated_forecasts = []
        forecast_records = []
        current_demand_by_key, trend_by_key, signal_by_key = self._load_evidence(combinations)
        existing_by_key = {}
        if combinations:
            existing = self.db.scalars(select(FutureDemandForecast).where(
                FutureDemandForecast.forecast_horizon_start == forecast_start,
                FutureDemandForecast.forecast_horizon_end == forecast_end,
            )).all()
            existing_by_key = {self._forecast_key(item): item for item in existing}
        updated = 0
        insufficient_data = 0
        
        for combo in combinations:
            # Generate forecast for this combination (skip existence check for speed)
            key = self._combo_key(combo)
            forecast = self._generate_single_forecast(
                combo,
                forecast_start,
                forecast_end,
                forecast_horizon_months,
                current_demand_by_key.get(key),
                trend_by_key.get(key),
                signal_by_key.get(key),
            )
            
            if forecast:
                existing = existing_by_key.get(key)
                if existing and regenerate_existing:
                    self._update_forecast(existing, forecast)
                    updated += 1
                elif existing:
                    continue
                else:
                    forecast_records.append(self._create_forecast_record(forecast))
                generated_forecasts.append(forecast)
                if forecast["forecast_level"] == "insufficient_data":
                    insufficient_data += 1
        
        # Bulk add all records at once
        if forecast_records:
            self.db.bulk_save_objects(forecast_records)
        self.db.commit()

        self.last_generation_stats = {
            "requested_combinations": max_combinations,
            "processed_combinations": len(combinations),
            "generated": len(forecast_records),
            "updated": updated,
            "insufficient_data": insufficient_data,
            "execution_time_seconds": round(perf_counter() - started_at, 3),
        }
        
        return generated_forecasts

    @staticmethod
    def _combo_key(combo: Dict) -> Tuple:
        return (combo["skill_id"], combo["job_role_id"], combo["district_id"])

    @staticmethod
    def _forecast_key(forecast: FutureDemandForecast) -> Tuple:
        return (forecast.skill_id, forecast.job_role_id, forecast.district_id)

    def _load_evidence(self, combinations: List[Dict]) -> Tuple[Dict, Dict, Dict]:
        """Load all evidence in batches and group it by skill/role/district."""
        if not combinations:
            return {}, {}, {}

        six_months_ago = date.today() - timedelta(days=180)
        three_months_ago = date.today() - timedelta(days=90)
        demand_rows = self.db.scalars(select(IndustryDemand)).all()
        current_rows = {}
        all_rows = {}
        for row in demand_rows:
            key = (row.skill_id, row.job_role_id, row.district_id)
            all_rows.setdefault(key, []).append(row)
            if row.period_end >= six_months_ago:
                current_rows.setdefault(key, []).append(row)

        current_index = {}
        trend_index = {}
        for combo in combinations:
            key = self._combo_key(combo)
            rows = current_rows.get(key) or sorted(all_rows.get(key, []), key=lambda item: item.period_end, reverse=True)[:1]
            if rows:
                score = sum(row.aggregate_demand_score for row in rows) / len(rows)
                current_index[key] = {
                    "score": score,
                    "level": self._score_to_demand_level(score),
                    "data_points": len(rows),
                    "records": rows,
                }

            current_total = sum(row.aggregate_demand_score for row in all_rows.get(key, [])
                                if row.period_start >= six_months_ago)
            previous_start = six_months_ago - timedelta(days=180)
            previous_total = sum(row.aggregate_demand_score for row in all_rows.get(key, [])
                                 if previous_start <= row.period_start < six_months_ago)
            change = ((current_total - previous_total) / previous_total * 100) if previous_total else 0
            trend_index[key] = {
                "trend_score": min(max(change / 10, -1), 1) if previous_total else 0,
                "indicator": "increasing" if change > 10 else "decreasing" if change < -10 else "stable",
                "change_percentage": change,
                "data_points": int(current_total > 0) + int(previous_total > 0),
            }

        signal_rows = self.db.execute(select(
            DemandSignal.skill_id, DemandSignal.job_role_id, DemandSignal.district_id
        ).where(DemandSignal.detected_at >= datetime.combine(three_months_ago, datetime.min.time()))).all()
        signal_counts = {}
        for row in signal_rows:
            key = (row.skill_id, row.job_role_id, row.district_id)
            signal_counts[key] = signal_counts.get(key, 0) + 1
        signal_index = {
            key: {"signal_score": min(count / 10, 1), "posting_count": count, "data_points": count}
            for key, count in signal_counts.items()
        }
        return current_index, trend_index, signal_index
    
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
        
        combinations = {}
        for row in results:
            key = (row.skill_id, row.job_role_id, row.district_id)
            combinations.setdefault(key, {
                "skill_id": row.skill_id,
                "job_role_id": row.job_role_id,
                "district_id": row.district_id,
                "industry_sector_id": row.industry_sector_id,
                "proficiency_level_id": row.proficiency_level_id,
            })
        return list(combinations.values())
    
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
        current_demand: Optional[Dict] = None,
        trend_analysis: Optional[Dict] = None,
        signal_analysis: Optional[Dict] = None,
    ) -> Optional[Dict]:
        """Generate a single forecast for a district-skill-role combination (optimized)."""
        
        # 1. Get current demand evidence (simplified)
        current_demand = current_demand or self._get_current_demand(
            combo["skill_id"], combo["job_role_id"], combo["district_id"]
        )
        
        if not current_demand:
            return None
        
        # 2. Simplified trend calculation (skip complex historical analysis)
        trend_analysis = trend_analysis or self._calculate_trend(
            combo["skill_id"], combo["job_role_id"], combo["district_id"]
        )
        trend_score = trend_analysis["trend_score"]
        growth_indicator = trend_analysis["indicator"]
        
        # 3. Simplified signal analysis (skip job posting analysis for speed)
        signal_analysis = signal_analysis or self._analyze_job_posting_signals(
            combo["skill_id"], combo["job_role_id"], combo["district_id"]
        )
        signal_score = signal_analysis["signal_score"]
        
        # 4. Calculate forecast score (simplified)
        normalized_demand = min(current_demand["score"] / 100, 1.0)
        forecast_score = self._calculate_forecast_score(normalized_demand * 100, trend_score, signal_score)
        
        # 5. Determine forecast level
        forecast_level = self._determine_forecast_level(forecast_score)
        
        # 6. Simplified confidence calculation
        confidence = self._calculate_confidence(
            current_demand["data_points"], trend_analysis["data_points"], signal_analysis["data_points"]
        )
        confidence_level = confidence["level"]
        confidence_score = confidence["score"]
        
        # 7. Simplified evidence summary
        evidence_summary = self._build_evidence_summary(
            current_demand, trend_analysis, signal_analysis, forecast_level, confidence_level
        )
        
        data_points = (
            current_demand["data_points"]
            + trend_analysis["data_points"]
            + signal_analysis["data_points"]
        )
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
    
    def _calculate_trend(
        self,
        skill_id: uuid.UUID,
        job_role_id: Optional[uuid.UUID],
        district_id: uuid.UUID
    ) -> Dict:
        """Calculate trend from historical demand data."""
        
        # Compare current 6 months vs previous 6 months
        current_end = date.today()
        current_start = current_end - timedelta(days=180)
        previous_end = current_start - timedelta(days=1)
        previous_start = previous_end - timedelta(days=180)
        
        # Get current period demand
        current_stmt = select(func.sum(IndustryDemand.aggregate_demand_score)).where(
            and_(
                IndustryDemand.skill_id == skill_id,
                IndustryDemand.district_id == district_id,
                IndustryDemand.period_start >= current_start,
                IndustryDemand.period_end <= current_end
            )
        )
        
        if job_role_id:
            current_stmt = current_stmt.where(IndustryDemand.job_role_id == job_role_id)
        
        current_demand = self.db.scalar(current_stmt) or 0
        
        # Get previous period demand
        previous_stmt = select(func.sum(IndustryDemand.aggregate_demand_score)).where(
            and_(
                IndustryDemand.skill_id == skill_id,
                IndustryDemand.district_id == district_id,
                IndustryDemand.period_start >= previous_start,
                IndustryDemand.period_end <= previous_end
            )
        )
        
        if job_role_id:
            previous_stmt = previous_stmt.where(IndustryDemand.job_role_id == job_role_id)
        
        previous_demand = self.db.scalar(previous_stmt) or 0
        
        # Calculate trend
        if previous_demand > 0:
            change_percentage = ((current_demand - previous_demand) / previous_demand) * 100
            trend_score = min(max(change_percentage / 10, -1), 1)  # Normalize to -1 to 1
        else:
            change_percentage = 0
            trend_score = 0
        
        # Determine growth indicator
        if change_percentage > 10:
            indicator = "increasing"
        elif change_percentage < -10:
            indicator = "decreasing"
        else:
            indicator = "stable"
        
        # Count data points
        data_points = 0
        if current_demand > 0:
            data_points += 1
        if previous_demand > 0:
            data_points += 1
        
        return {
            "trend_score": trend_score,
            "indicator": indicator,
            "change_percentage": change_percentage,
            "current_demand": current_demand,
            "previous_demand": previous_demand,
            "data_points": data_points
        }
    
    def _analyze_job_posting_signals(
        self,
        skill_id: uuid.UUID,
        job_role_id: Optional[uuid.UUID],
        district_id: uuid.UUID
    ) -> Dict:
        """Analyze real-time demand signals from job postings."""
        
        # Get job postings from last 3 months
        three_months_ago = date.today() - timedelta(days=90)
        
        stmt = select(JobPosting).where(
            and_(
                JobPosting.district_id == district_id,
                JobPosting.posted_date >= three_months_ago,
                JobPosting.status == "open"
            )
        )
        
        if job_role_id:
            stmt = stmt.where(JobPosting.job_role_id == job_role_id)
        
        job_postings = self.db.scalars(stmt).all()
        
        if not job_postings:
            return {
                "signal_score": 0,
                "posting_count": 0,
                "data_points": 0
            }
        
        # Count postings that require this skill
        # (This is a simplified analysis - in production you'd join with job_posting_skills)
        posting_count = len(job_postings)
        
        # Normalize signal score (0 to 1)
        signal_score = min(posting_count / 10, 1)  # 10+ postings = max signal
        
        return {
            "signal_score": signal_score,
            "posting_count": posting_count,
            "data_points": posting_count
        }
    
    def _calculate_forecast_score(
        self,
        current_demand_score: float,
        trend_score: float,
        signal_score: float
    ) -> float:
        """Calculate overall forecast score from component scores."""
        
        # Normalize current demand score to 0-1 range
        # Assuming max reasonable demand score is around 100
        normalized_demand = min(current_demand_score / 100, 1.0)
        
        # Weighted combination of factors
        # Current demand: 40%, Trend: 40%, Signals: 20%
        forecast_score = (
            (normalized_demand * 0.4) +
            (trend_score * 0.4) +
            (signal_score * 0.2)
        )
        
        return forecast_score
    
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
    
    def _calculate_confidence(
        self,
        current_data_points: int,
        trend_data_points: int,
        signal_data_points: int
    ) -> Dict:
        """Calculate confidence level based on data availability."""
        
        total_data_points = current_data_points + trend_data_points + signal_data_points
        
        if total_data_points >= 10:
            confidence_level = "high"
            confidence_score = 0.9
        elif total_data_points >= 5:
            confidence_level = "medium"
            confidence_score = 0.6
        elif total_data_points >= 2:
            confidence_level = "low"
            confidence_score = 0.3
        else:
            confidence_level = "insufficient"
            confidence_score = 0.1
        
        return {
            "level": confidence_level,
            "score": confidence_score,
            "data_points": total_data_points
        }
    
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
    
    def _build_evidence_summary(
        self,
        current_demand: Dict,
        trend_analysis: Dict,
        signal_analysis: Dict,
        forecast_level: str,
        confidence_level: str
    ) -> str:
        """Build human-readable evidence summary."""
        
        parts = []
        
        # Current demand
        parts.append(f"Current demand level: {current_demand['level']} (score: {current_demand['score']:.1f})")
        
        # Trend
        if trend_analysis["indicator"] != "stable":
            parts.append(f"Trend: {trend_analysis['indicator']} ({trend_analysis['change_percentage']:.1f}% change)")
        else:
            parts.append("Trend: stable")
        
        # Job posting signals
        if signal_analysis["posting_count"] > 0:
            parts.append(f"Recent job postings: {signal_analysis['posting_count']}")
        
        # Forecast and confidence
        parts.append(f"Forecast: {forecast_level.replace('_', ' ').title()}")
        parts.append(f"Confidence: {confidence_level.replace('_', ' ').title()}")
        
        return ". ".join(parts) + "."
    
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
    
    def _update_forecast(self, existing: FutureDemandForecast, new_data: Dict):
        """Update an existing forecast with new data."""
        
        existing.current_demand_score = new_data["current_demand_score"]
        existing.current_demand_level = new_data["current_demand_level"]
        existing.trend_score = new_data["trend_score"]
        existing.growth_indicator = new_data["growth_indicator"]
        existing.forecast_level = new_data["forecast_level"]
        existing.confidence_score = new_data["confidence_score"]
        existing.confidence_level = new_data["confidence_level"]
        existing.evidence_summary = new_data["evidence_summary"]
        existing.data_points_used = new_data["data_points_used"]
        existing.updated_at = datetime.now()
    
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