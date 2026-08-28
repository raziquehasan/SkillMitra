"""Course health scoring service."""
from __future__ import annotations

from datetime import date, datetime, timezone
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.career import Course, CourseSkill
from app.models.demand import IndustryDemand
from app.models.phase4 import CourseOffering
from app.models.phase6 import EmployerCurriculumValidation
from app.models.phase8 import CourseHealthScore, EmergingTechnology, TechnologySkill
from app.models.skills import Skill


class CourseHealthScoreService:
    """Calculate course health scores from available evidence."""

    def __init__(self, db: Session):
        self.db = db

    def calculate_course_health(self, course_id: str, period_start: date | None = None, period_end: date | None = None) -> dict[str, Any]:
        """Calculate health score for a course."""
        course = self.db.get(Course, course_id)
        if not course:
            return {"error": "Course not found"}

        today = date.today()
        period_start = period_start or today
        period_end = period_end or today

        # 1. Demand score
        demand_result = self._calculate_demand_score(course_id)
        demand_score = demand_result.get("score")
        demand_explanation = demand_result.get("explanation", "")

        # 2. Skill alignment score
        alignment_result = self._calculate_skill_alignment_score(course_id)
        skill_alignment_score = alignment_result.get("score")
        skill_alignment_explanation = alignment_result.get("explanation", "")

        # 3. Placement score
        placement_result = self._calculate_placement_score(course_id)
        placement_score = placement_result.get("score")
        placement_explanation = placement_result.get("explanation", "")

        # 4. Employer validation score
        employer_result = self._calculate_employer_validation_score(course_id)
        employer_validation_score = employer_result.get("score")
        employer_explanation = employer_result.get("explanation", "")

        # 5. Technology relevance score
        tech_result = self._calculate_technology_relevance_score(course_id)
        technology_relevance_score = tech_result.get("score")
        tech_explanation = tech_result.get("explanation", "")

        # 6. Supply/demand score
        supply_result = self._calculate_supply_demand_score(course_id)
        supply_demand_score = supply_result.get("score")
        supply_explanation = supply_result.get("explanation", "")

        # Collect non-null scores for overall
        scores = []
        if demand_score is not None:
            scores.append(demand_score)
        if skill_alignment_score is not None:
            scores.append(skill_alignment_score)
        if placement_score is not None:
            scores.append(placement_score)
        if employer_validation_score is not None:
            scores.append(employer_validation_score)
        if technology_relevance_score is not None:
            scores.append(technology_relevance_score)
        if supply_demand_score is not None:
            scores.append(supply_demand_score)

        overall_score = round(sum(scores) / len(scores), 1) if scores else None

        # Determine status
        if overall_score is None or len(scores) < 2:
            status = "INSUFFICIENT_DATA"
            recommended_status = "obsolete_review"
        elif overall_score >= 75:
            status = "HEALTHY"
            recommended_status = "relevant"
        elif overall_score >= 50:
            status = "NEEDS_UPDATE"
            recommended_status = "needs_update"
        elif overall_score >= 25:
            status = "LOW_ALIGNMENT"
            recommended_status = "low_demand"
        else:
            status = "OVERSUPPLIED_SIGNAL"
            recommended_status = "oversupplied"

        explanation = self._build_explanation(
            demand_explanation, skill_alignment_explanation, placement_explanation,
            employer_explanation, tech_explanation, supply_explanation,
            overall_score, status
        )

        data_completeness = {
            "demand": demand_score is not None,
            "skill_alignment": skill_alignment_score is not None,
            "placement": placement_score is not None,
            "employer_validation": employer_validation_score is not None,
            "technology_relevance": technology_relevance_score is not None,
            "supply_demand": supply_demand_score is not None,
            "components_available": len(scores),
            "components_total": 6,
        }

        score_details = {
            "explanation": explanation,
            "data_completeness": data_completeness,
            "component_explanations": {
                "demand": demand_explanation,
                "skill_alignment": skill_alignment_explanation,
                "placement": placement_explanation,
                "employer_validation": employer_explanation,
                "technology_relevance": tech_explanation,
                "supply_demand": supply_explanation,
            },
        }

        # Upsert course_health_scores
        existing = self.db.scalar(
            select(CourseHealthScore).where(
                CourseHealthScore.course_id == course_id,
                CourseHealthScore.period_start == period_start,
                CourseHealthScore.period_end == period_end,
            )
        )

        if existing:
            existing.industry_demand_score = demand_score
            existing.placement_score = placement_score
            existing.employer_validation_score = employer_validation_score
            existing.curriculum_alignment_score = skill_alignment_score
            existing.future_trend_score = technology_relevance_score
            existing.supply_demand_score = supply_demand_score
            existing.overall_score = overall_score
            existing.recommended_status = recommended_status
            existing.score_details = score_details
            existing.updated_at = datetime.now(timezone.utc)
            self.db.commit()
            self.db.refresh(existing)
            record = existing
        else:
            record = CourseHealthScore(
                course_id=course_id,
                industry_demand_score=demand_score,
                placement_score=placement_score,
                employer_validation_score=employer_validation_score,
                curriculum_alignment_score=skill_alignment_score,
                future_trend_score=technology_relevance_score,
                supply_demand_score=supply_demand_score,
                overall_score=overall_score,
                recommended_status=recommended_status,
                period_start=period_start,
                period_end=period_end,
                score_details=score_details,
            )
            self.db.add(record)
            self.db.commit()
            self.db.refresh(record)

        return {
            "course_id": str(course_id),
            "course_title": course.title,
            "demand_score": demand_score,
            "skill_alignment_score": skill_alignment_score,
            "placement_score": placement_score,
            "employer_validation_score": employer_validation_score,
            "technology_relevance_score": technology_relevance_score,
            "supply_demand_score": supply_demand_score,
            "overall_score": overall_score,
            "status": status,
            "recommended_status": record.recommended_status,
            "review_status": record.review_status,
            "final_status": record.final_status,
            "explanation": explanation,
            "data_completeness": data_completeness,
            "period_start": str(period_start),
            "period_end": str(period_end),
            "calculated_at": record.updated_at.isoformat() if record.updated_at else None,
        }

    def _calculate_demand_score(self, course_id: str) -> dict[str, Any]:
        """Calculate demand score based on industry demand for course skills."""
        course_skills = self.db.scalars(
            select(CourseSkill.skill_id).where(CourseSkill.course_id == course_id)
        ).all()

        if not course_skills:
            return {"score": None, "explanation": "No course skills defined"}

        demand_rows = self.db.scalars(
            select(IndustryDemand).where(IndustryDemand.skill_id.in_(course_skills))
        ).all()

        if not demand_rows:
            return {"score": None, "explanation": "No industry demand data for course skills"}

        scores = [row.aggregate_demand_score for row in demand_rows if row.aggregate_demand_score is not None]
        if not scores:
            return {"score": None, "explanation": "Demand records exist but have no scores"}

        avg_demand = sum(scores) / len(scores)
        # Normalize: current demand scores are roughly 0-3, scale to 0-100
        normalized = min(max((avg_demand / 3.0) * 100, 0), 100)
        return {
            "score": round(normalized, 1),
            "explanation": f"Average demand score {avg_demand:.2f} across {len(scores)} skill-demand records",
        }

    def _calculate_skill_alignment_score(self, course_id: str) -> dict[str, Any]:
        """Calculate skill alignment: how well course skills match demanded skills."""
        course_skills = set(self.db.scalars(
            select(CourseSkill.skill_id).where(CourseSkill.course_id == course_id)
        ).all())

        if not course_skills:
            return {"score": None, "explanation": "No course skills defined"}

        # Get all demanded skills
        demanded_skills = set(self.db.scalars(
            select(IndustryDemand.skill_id).distinct()
        ).all())

        if not demanded_skills:
            return {"score": None, "explanation": "No industry demand data available"}

        covered = course_skills & demanded_skills
        if not covered:
            return {"score": 0.0, "explanation": "Course teaches no skills that appear in industry demand"}

        coverage_pct = (len(covered) / len(demanded_skills)) * 100
        return {
            "score": round(coverage_pct, 1),
            "explanation": f"Course covers {len(covered)} of {len(demanded_skills)} demanded skills ({coverage_pct:.1f}%)",
        }

    def _calculate_placement_score(self, course_id: str) -> dict[str, Any]:
        """Calculate placement score from placement outcomes."""
        from app.models.career import CourseEnrollment
        from app.models.market import Placement

        completed_enrollments = self.db.scalar(
            select(func.count()).select_from(CourseEnrollment).where(
                CourseEnrollment.course_id == course_id,
                CourseEnrollment.status == "completed",
            )
        ) or 0

        if completed_enrollments == 0:
            return {"score": None, "explanation": "No completed enrollments for placement analysis"}

        placed = self.db.scalar(
            select(func.count()).select_from(Placement).join(
                CourseEnrollment, Placement.enrollment_id == CourseEnrollment.id
            ).where(
                CourseEnrollment.course_id == course_id,
                CourseEnrollment.status == "completed",
            )
        ) or 0

        rate = (placed / completed_enrollments) * 100
        return {
            "score": round(rate, 1),
            "explanation": f"{placed} placements out of {completed_enrollments} completed enrollments ({rate:.1f}%)",
        }

    def _calculate_employer_validation_score(self, course_id: str) -> dict[str, Any]:
        """Calculate employer validation score."""
        validations = self.db.scalars(
            select(EmployerCurriculumValidation).where(
                EmployerCurriculumValidation.course_id == course_id
            )
        ).all()

        if not validations:
            return {"score": None, "explanation": "No employer curriculum validations"}

        status_scores = {
            "relevant": 100,
            "partially_relevant": 70,
            "outdated": 30,
            "missing_skills": 20,
            "proficiency_mismatch": 20,
            "equipment_mismatch": 20,
        }

        scores = [status_scores.get(v.status, 50) for v in validations]
        avg = sum(scores) / len(scores)
        return {
            "score": round(avg, 1),
            "explanation": f"Averaged {len(scores)} employer validations",
        }

    def _calculate_technology_relevance_score(self, course_id: str) -> dict[str, Any]:
        """Calculate technology relevance from emerging technologies."""
        course_skills = list(self.db.scalars(
            select(CourseSkill.skill_id).where(CourseSkill.course_id == course_id)
        ).all())

        if not course_skills:
            return {"score": None, "explanation": "No course skills to assess technology relevance"}

        tech_links = self.db.scalars(
            select(TechnologySkill).where(TechnologySkill.skill_id.in_(course_skills))
        ).all()

        if not tech_links:
            return {"score": None, "explanation": "No emerging technology links for course skills"}

        tech_ids = [link.technology_id for link in tech_links]
        techs = self.db.scalars(
            select(EmergingTechnology).where(EmergingTechnology.id.in_(tech_ids))
        ).all()

        if not techs:
            return {"score": None, "explanation": "No emerging technology records found"}

        confidence_scores = {"high": 100, "medium": 60, "low": 30}
        trend_scores = {"emerging": 100, "rising": 80, "stable": 60, "declining": 30, "obsolete": 0}

        scores = []
        for tech in techs:
            c_score = confidence_scores.get(tech.confidence, 50)
            t_score = trend_scores.get(tech.trend_direction, 50)
            scores.append((c_score + t_score) / 2)

        avg = sum(scores) / len(scores)
        return {
            "score": round(avg, 1),
            "explanation": f"Linked to {len(techs)} emerging technologies",
        }

    def _calculate_supply_demand_score(self, course_id: str) -> dict[str, Any]:
        """Calculate supply/demand signal."""
        offerings = self.db.scalars(
            select(CourseOffering).where(CourseOffering.course_id == course_id)
        ).all()

        if not offerings:
            return {"score": None, "explanation": "No course offerings/capacity data"}

        total_capacity = sum(o.active_seats for o in offerings)
        if total_capacity == 0:
            return {"score": None, "explanation": "Course offerings exist but have zero active capacity"}

        # Get demand for course skills
        course_skills = list(self.db.scalars(
            select(CourseSkill.skill_id).where(CourseSkill.course_id == course_id)
        ).all())

        if not course_skills:
            return {"score": None, "explanation": "No course skills to assess supply against demand"}

        demand_count = self.db.scalar(
            select(func.count()).select_from(IndustryDemand).where(
                IndustryDemand.skill_id.in_(course_skills)
            )
        ) or 0

        if demand_count == 0:
            return {"score": None, "explanation": "No demand data for supply comparison"}

        # Supply/demand ratio: capacity per demand record
        # Higher ratio = more supply relative to demand = oversupplied signal
        ratio = total_capacity / demand_count if demand_count > 0 else 0
        # Invert: high ratio -> low score (oversupplied), low ratio -> high score (undersupplied)
        # Normalize: ratio of 1.0 -> 50, ratio > 2 -> approaching 0, ratio < 0.5 -> approaching 100
        score = max(0, min(100, 100 - (ratio * 50)))

        return {
            "score": round(score, 1),
            "explanation": f"Capacity {total_capacity} vs {demand_count} demand records (ratio {ratio:.2f})",
        }

    def _build_explanation(self, demand_exp, alignment_exp, placement_exp, employer_exp, tech_exp, supply_exp, overall_score, status) -> str:
        """Build human-readable explanation."""
        parts = []
        if demand_exp and "No" not in demand_exp:
            parts.append(f"Demand: {demand_exp}")
        if alignment_exp and "No" not in alignment_exp:
            parts.append(f"Alignment: {alignment_exp}")
        if placement_exp and "No" not in placement_exp:
            parts.append(f"Placement: {placement_exp}")
        if employer_exp and "No" not in employer_exp:
            parts.append(f"Employer: {employer_exp}")
        if tech_exp and "No" not in tech_exp:
            parts.append(f"Technology: {tech_exp}")
        if supply_exp and "No" not in supply_exp:
            parts.append(f"Supply: {supply_exp}")

        if not parts:
            return f"Insufficient data to determine course health. Status: {status}"

        overall_text = f"Overall score: {overall_score:.1f}/100" if overall_score is not None else "Overall score: not calculable"
        return f"{overall_text}. " + "; ".join(parts) + f". Status: {status}"

    def get_course_health(self, course_id: str) -> dict[str, Any]:
        """Get existing or calculate new health score."""
        today = date.today()
        record = self.db.scalar(
            select(CourseHealthScore).where(
                CourseHealthScore.course_id == course_id,
                CourseHealthScore.period_start == today,
                CourseHealthScore.period_end == today,
            )
        )

        if record:
            return self._record_to_dict(record)

        return self.calculate_course_health(course_id, today, today)

    def _record_to_dict(self, record: CourseHealthScore) -> dict[str, Any]:
        """Convert CourseHealthScore record to response dict."""
        details = record.score_details or {}
        return {
            "course_id": str(record.course_id),
            "demand_score": record.industry_demand_score,
            "skill_alignment_score": record.curriculum_alignment_score,
            "placement_score": record.placement_score,
            "employer_validation_score": record.employer_validation_score,
            "technology_relevance_score": record.future_trend_score,
            "supply_demand_score": record.supply_demand_score,
            "overall_score": record.overall_score,
            "status": self._map_recommended_status(record.recommended_status),
            "recommended_status": record.recommended_status,
            "review_status": record.review_status,
            "final_status": record.final_status,
            "explanation": details.get("explanation", ""),
            "data_completeness": details.get("data_completeness", {}),
            "period_start": str(record.period_start) if record.period_start else None,
            "period_end": str(record.period_end) if record.period_end else None,
            "calculated_at": record.updated_at.isoformat() if record.updated_at else None,
        }

    def _map_recommended_status(self, recommended_status: str) -> str:
        """Map DB recommended_status to API status."""
        mapping = {
            "relevant": "HEALTHY",
            "needs_update": "NEEDS_UPDATE",
            "oversupplied": "OVERSUPPLIED_SIGNAL",
            "low_demand": "LOW_ALIGNMENT",
            "obsolete_review": "MANUAL_REVIEW",
        }
        return mapping.get(recommended_status, "MANUAL_REVIEW")
