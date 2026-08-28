"""Course alignment, training recommendation, and provider reference services."""
from __future__ import annotations

from datetime import date, datetime, timezone
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.career import Course, CourseSkill
from app.models.demand import IndustryDemand
from app.models.geography import District
from app.models.phase4 import DistrictTrainingPlan, DistrictTrainingPlanItem
from app.models.skills import Skill


class CourseAlignmentService:
    """Analyze alignment between industry demand and existing courses."""

    def __init__(self, db: Session):
        self.db = db

    def get_course_skill_coverage(self, demand_id: str) -> dict[str, Any]:
        """Calculate how well an existing course covers demanded skills."""
        demand = self.db.get(IndustryDemand, demand_id)
        if not demand:
            return {"error": "Demand record not found"}

        # Find courses that cover the demanded skill
        courses = (
            self.db.scalars(
                select(Course)
                .join(CourseSkill)
                .where(CourseSkill.skill_id == demand.skill_id)
                .distinct()
            )
            .unique()
            .all()
        )

        if not courses:
            return {
                "demand_id": demand_id,
                "skill_id": str(demand.skill_id),
                "coverage_status": "UNMATCHED",
                "matching_courses": [],
            }

        matching_courses = []
        for course in courses:
            course_skills = [cs.skill_id for cs in course.course_skills]
            covered = demand.skill_id in course_skills
            matching_courses.append({
                "course_id": str(course.id),
                "course_title": course.title,
                "covers_demanded_skill": covered,
                "course_skills": [str(sid) for sid in course_skills],
            })

        return {
            "demand_id": demand_id,
            "skill_id": str(demand.skill_id),
            "coverage_status": "PARTIAL" if len(matching_courses) == 1 else "MULTIPLE",
            "matching_courses": matching_courses,
        }

    def get_district_course_alignment(self, district_id: str) -> dict[str, Any]:
        """Get course alignment summary for a district's demand."""
        demands = (
            self.db.scalars(
                select(IndustryDemand)
                .where(IndustryDemand.district_id == district_id)
                .order_by(IndustryDemand.aggregate_demand_score.desc())
            )
            .unique()
            .all()
        )

        results = []
        for demand in demands:
            coverage = self.get_course_skill_coverage(str(demand.id))
            results.append({
                "demand_id": str(demand.id),
                "skill_id": str(demand.skill_id),
                "job_role_id": str(demand.job_role_id) if demand.job_role_id else None,
                "district_id": str(demand.district_id),
                "demand_score": demand.aggregate_demand_score,
                "coverage": coverage,
            })

        return {
            "district_id": district_id,
            "total_demands": len(demands),
            "alignment": results,
        }

    def get_skill_gap_analysis(self, job_role_id: str) -> dict[str, Any]:
        """Analyze skill gap for a job role against existing courses."""
        # Get required skills from job_role_skills
        from app.models.career import JobRoleSkill
        from app.models.skills import SkillProficiencyLevel

        role_skills = (
            self.db.scalars(
                select(JobRoleSkill)
                .where(JobRoleSkill.job_role_id == job_role_id)
            )
            .unique()
            .all()
        )

        if not role_skills:
            return {
                "job_role_id": job_role_id,
                "required_skills": [],
                "course_analysis": [],
                "status": "MANUAL_REVIEW",
                "reason": "No job-role skill requirements defined",
            }

        required_skills = [rs.skill_id for rs in role_skills]

        # Find courses that cover these skills
        courses = (
            self.db.scalars(
                select(Course)
                .join(CourseSkill)
                .where(CourseSkill.skill_id.in_(required_skills))
                .distinct()
            )
            .unique()
            .all()
        )

        course_analysis = []
        for course in courses:
            covered = {cs.skill_id for cs in course.course_skills if cs.skill_id in required_skills}
            missing = set(required_skills) - covered
            coverage_pct = len(covered) / len(required_skills) * 100 if required_skills else 0

            if coverage_pct >= 80:
                recommendation = "EXISTING_COURSE_SUFFICIENT"
            elif coverage_pct >= 50:
                recommendation = "CURRICULUM_UPDATE"
            else:
                recommendation = "NEW_COURSE_REQUIRED"

            course_analysis.append({
                "course_id": str(course.id),
                "course_title": course.title,
                "required_skills": [str(sid) for sid in required_skills],
                "covered_skills": [str(sid) for sid in covered],
                "missing_skills": [str(sid) for sid in missing],
                "coverage_percentage": round(coverage_pct, 1),
                "recommendation": recommendation,
            })

        return {
            "job_role_id": job_role_id,
            "required_skills": [str(sid) for sid in required_skills],
            "course_analysis": course_analysis,
        }


class TrainingProviderReferenceService:
    """Handle source availability text and provider verification."""

    def __init__(self, db: Session):
        self.db = db

    def get_source_availability(self, district_id: str, job_role_id: str | None = None) -> list[dict[str, Any]]:
        """Get source training availability text from district training plan items."""
        stmt = select(DistrictTrainingPlanItem).where(
            DistrictTrainingPlanItem.plan_id.in_(
                select(DistrictTrainingPlan.id).where(
                    DistrictTrainingPlan.district_id == district_id
                )
            )
        )
        if job_role_id:
            stmt = stmt.where(DistrictTrainingPlanItem.job_role_id == job_role_id)

        items = self.db.scalars(stmt).unique().all()

        results = []
        for item in items:
            # Extract source availability text from rationale
            rationale = item.rationale or ""
            source_text = ""
            if "Available at:" in rationale:
                source_text = rationale.split("Available at:")[1].strip().rstrip(".")

            results.append({
                "plan_item_id": str(item.id),
                "skill_id": str(item.skill_id),
                "job_role_id": str(item.job_role_id) if item.job_role_id else None,
                "source_availability_text": source_text if source_text else None,
                "course_id": str(item.course_id) if item.course_id else None,
                "recommended_action": item.recommended_action,
                "verification_status": "UNVERIFIED",
            })

        return results

    def get_provider_verification_status(self, provider_id: str) -> dict[str, Any]:
        """Get verification status for a training provider."""
        from app.models.phase4 import TrainingProvider

        provider = self.db.get(TrainingProvider, provider_id)
        if not provider:
            return {"error": "Provider not found"}

        return {
            "provider_id": str(provider.id),
            "name": provider.name,
            "provider_type": provider.provider_type,
            "status": provider.status,
            "verification_status": "VERIFIED" if provider.status == "active" else "UNVERIFIED",
        }


class DistrictRecommendationService:
    """Generate district-level training recommendations."""

    def __init__(self, db: Session):
        self.db = db
        self.course_svc = CourseAlignmentService(db)
        self.provider_svc = TrainingProviderReferenceService(db)

    def get_district_recommendations(self, district_id: str) -> dict[str, Any]:
        """Get comprehensive training recommendations for a district."""
        district = self.db.get(District, district_id)
        if not district:
            return {"error": "District not found"}

        # Get district training plan
        plan = self.db.scalar(
            select(DistrictTrainingPlan).where(
                DistrictTrainingPlan.district_id == district_id,
                DistrictTrainingPlan.period_start <= date.today(),
                DistrictTrainingPlan.period_end >= date.today(),
            )
        )

        if not plan:
            return {
                "district_id": district_id,
                "district_name": district.name,
                "status": "NO_ACTIVE_PLAN",
                "recommendations": [],
            }

        # Get plan items
        items = (
            self.db.scalars(
                select(DistrictTrainingPlanItem).where(
                    DistrictTrainingPlanItem.plan_id == plan.id
                )
            )
            .unique()
            .all()
        )

        recommendations = []
        for item in items:
            # Get course alignment
            course_alignment = self.course_svc.get_course_skill_coverage(str(item.id))

            # Get provider availability
            provider_info = self.provider_svc.get_source_availability(district_id, str(item.job_role_id) if item.job_role_id else None)

            recommendations.append({
                "plan_item_id": str(item.id),
                "skill_id": str(item.skill_id),
                "job_role_id": str(item.job_role_id) if item.job_role_id else None,
                "demand_value": item.demand_value,
                "gap_value": item.gap_value,
                "recommended_action": item.recommended_action,
                "rationale": item.rationale,
                "course_id": str(item.course_id) if item.course_id else None,
                "course_alignment": course_alignment,
                "provider_availability": provider_info[0] if provider_info else None,
            })

        return {
            "district_id": district_id,
            "district_name": district.name,
            "plan_id": str(plan.id),
            "plan_status": plan.status,
            "period_start": str(plan.period_start),
            "period_end": str(plan.period_end),
            "total_recommendations": len(recommendations),
            "recommendations": recommendations,
        }

    def get_skill_gap_summary(self, district_id: str) -> dict[str, Any]:
        """Get skill gap summary for a district."""
        alignment = self.course_svc.get_district_course_alignment(district_id)

        unmatched = []
        for item in alignment.get("alignment", []):
            if item["coverage"]["coverage_status"] == "UNMATCHED":
                unmatched.append({
                    "demand_id": item["demand_id"],
                    "skill_id": item["skill_id"],
                    "job_role_id": item["job_role_id"],
                    "demand_score": item["demand_score"],
                })

        return {
            "district_id": district_id,
            "total_demands": alignment["total_demands"],
            "unmatched_count": len(unmatched),
            "unmatched_skills": unmatched,
        }
