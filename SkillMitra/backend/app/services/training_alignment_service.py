"""Course alignment, training recommendation, provider reference, and operational intelligence services."""
from __future__ import annotations

from datetime import date, datetime, timezone
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session
from typing import Any

from app.models.career import Course, CourseEnrollment, CourseSkill, JobRoleSkill
from app.models.demand import DataSource, IndustryDemand
from app.models.geography import District
from app.models.identity import User
from app.models.market import JobPosting, Placement
from app.models.demand import EmployerSurvey
from app.models.phase4 import (
    CourseEquipmentRequirement,
    CourseOffering,
    CurriculumVersion,
    DistrictTrainingPlan,
    DistrictTrainingPlanItem,
    Equipment,
    Trainer,
    TrainerSkill,
    TrainingProvider,
)
from app.models.phase6 import EmployerCurriculumValidation
from app.models.phase9 import AuditLog, CurriculumProposal
from app.models.skills import Skill, SkillProficiencyLevel


class CourseAlignmentService:
    """Analyze alignment between industry demand and existing courses."""

    def __init__(self, db: Session):
        self.db = db

    def get_course_skill_coverage(self, demand_id: str) -> dict[str, Any]:
        """Calculate how well an existing course covers demanded skills."""
        demand = self.db.get(IndustryDemand, demand_id)
        if not demand:
            return {"error": "Demand record not found"}

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

    def get_district_course_alignment(self, district_id: str, source_type: str | None = None) -> dict[str, Any]:
        """Get course alignment summary for a district's demand, optionally filtered by source type."""
        stmt = select(IndustryDemand).where(IndustryDemand.district_id == district_id)
        if source_type:
            stmt = stmt.join(DataSource, IndustryDemand.industry_sector_id == DataSource.id).where(DataSource.source_category == source_type)
        stmt = stmt.order_by(IndustryDemand.aggregate_demand_score.desc())
        demands = self.db.scalars(stmt).unique().all()

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

            # Add curriculum status classification
            curriculum_status = self._classify_curriculum_status(course, coverage_pct, len(required_skills))

            course_analysis.append({
                "course_id": str(course.id),
                "course_title": course.title,
                "required_skills": [str(sid) for sid in required_skills],
                "covered_skills": [str(sid) for sid in covered],
                "missing_skills": [str(sid) for sid in missing],
                "coverage_percentage": round(coverage_pct, 1),
                "recommendation": recommendation,
                "curriculum_status": curriculum_status,
            })

        return {
            "job_role_id": job_role_id,
            "required_skills": [str(sid) for sid in required_skills],
            "course_analysis": course_analysis,
        }

    def _classify_curriculum_status(self, course: Course, coverage_pct: float, required_skill_count: int) -> dict[str, Any]:
        """Classify course curriculum status based on evidence."""
        from app.models.phase6 import EmployerCurriculumValidation
        from app.models.phase8 import CourseHealthScore

        # Get employer validations
        validations = self.db.scalars(
            select(EmployerCurriculumValidation).where(
                EmployerCurriculumValidation.course_id == course.id
            )
        ).all()

        # Get course health score if available
        health_score = self.db.scalar(
            select(CourseHealthScore).where(
                CourseHealthScore.course_id == course.id
            ).order_by(CourseHealthScore.updated_at.desc())
        )

        # Determine status based on evidence
        if health_score and health_score.overall_score is not None:
            if health_score.overall_score >= 75:
                status = "aligned"
                confidence = "high"
            elif health_score.overall_score >= 50:
                status = "partially_aligned"
                confidence = "medium"
            elif health_score.overall_score >= 25:
                status = "needs_review"
                confidence = "medium"
            else:
                status = "legacy_obsolete"
                confidence = "medium"
            evidence_source = "course_health_score"
        elif validations:
            # Use employer validation if no health score
            status_counts = {}
            for v in validations:
                status_counts[v.status] = status_counts.get(v.status, 0) + 1
            top_status = max(status_counts.items(), key=lambda x: x[1])[0]

            if top_status == "relevant":
                status = "aligned"
                confidence = "medium"
            elif top_status == "partially_relevant":
                status = "partially_aligned"
                confidence = "medium"
            elif top_status == "outdated":
                status = "legacy_obsolete"
                confidence = "medium"
            else:
                status = "needs_review"
                confidence = "medium"
            evidence_source = "employer_validation"
        elif coverage_pct >= 80:
            status = "aligned"
            confidence = "low"
            evidence_source = "skill_coverage_only"
        elif coverage_pct >= 50:
            status = "partially_aligned"
            confidence = "low"
            evidence_source = "skill_coverage_only"
        else:
            status = "insufficient_evidence"
            confidence = "insufficient"
            evidence_source = "insufficient_data"

        return {
            "status": status,
            "confidence": confidence,
            "evidence_source": evidence_source,
            "coverage_percentage": coverage_pct,
            "employer_validation_count": len(validations),
            "has_health_score": health_score is not None,
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
        provider = self.db.get(TrainingProvider, provider_id)
        if not provider:
            return {"error": "Provider not found"}

        return {
            "provider_id": str(provider.id),
            "name": provider.name,
            "provider_type": provider.provider_type,
            "status": provider.status,
            "verification_status": provider.verification_status,
            "reviewed_at": provider.reviewed_at.isoformat() if provider.reviewed_at else None,
            "review_notes": provider.review_notes,
        }

    def register_provider(self, user_id: str, district_id: str, name: str, provider_type: str | None = None, registration_number: str | None = None) -> dict[str, Any]:
        """Register a new training provider with pending verification."""
        existing = self.db.scalar(select(TrainingProvider).where(TrainingProvider.user_id == user_id))
        if existing:
            return {"error": "Provider profile already exists", "provider_id": str(existing.id)}

        provider = TrainingProvider(
            user_id=user_id,
            district_id=district_id,
            name=name,
            provider_type=provider_type,
            registration_number=registration_number,
            verification_status="pending_verification",
            submitted_at=datetime.now(timezone.utc),
        )
        self.db.add(provider)
        self.db.commit()
        self.db.refresh(provider)
        return {
            "provider_id": str(provider.id),
            "name": provider.name,
            "verification_status": provider.verification_status,
            "submitted_at": provider.submitted_at.isoformat() if provider.submitted_at else None,
        }


class DistrictRecommendationService:
    """Generate district-level training recommendations."""

    def __init__(self, db: Session):
        self.db = db
        self.course_svc = CourseAlignmentService(db)
        self.provider_svc = TrainingProviderReferenceService(db)

    def get_district_recommendations(self, district_id: str, source_type: str | None = None) -> dict[str, Any]:
        """Get comprehensive training recommendations for a district."""
        district = self.db.get(District, district_id)
        if not district:
            return {"error": "District not found"}

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
            course_alignment = self.course_svc.get_course_skill_coverage(str(item.id))
            provider_info = self.provider_svc.get_source_availability(district_id, str(item.job_role_id) if item.job_role_id else None)

            recommendations.append({
                "plan_item_id": str(item.id),
                "skill_id": str(item.skill_id),
                "job_role_id": str(item.job_role_id) if item.job_role_id else None,
                "demand_value": item.demand_value,
                "gap_value": item.gap_value,
                "recommended_action": item.recommended_action,
                "review_status": item.review_status,
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

    def get_skill_gap_summary(self, district_id: str, source_type: str | None = None) -> dict[str, Any]:
        """Get skill gap summary for a district."""
        alignment = self.course_svc.get_district_course_alignment(district_id, source_type)

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

    def _extract_skill_gaps(self, district_id: str) -> list[dict[str, Any]]:
        """Extract skill gaps for district intelligence."""
        alignment = self.get_district_course_alignment(district_id)
        gaps = []
        for item in alignment.get("alignment", []):
            if item["coverage"]["coverage_status"] == "UNMATCHED":
                gaps.append({
                    "demand_id": item["demand_id"],
                    "skill_id": item["skill_id"],
                    "job_role_id": item["job_role_id"],
                    "demand_score": item["demand_score"],
                })
        return gaps


class CapacityGapService:
    """Calculate training capacity gaps for districts."""

    def __init__(self, db: Session):
        self.db = db

    def get_district_capacity(self, district_id: str) -> dict[str, Any]:
        """Calculate capacity status for a district's demand."""
        district = self.db.get(District, district_id)
        if not district:
            return {"error": "District not found"}

        # Demand
        demand_stmt = select(func.count()).select_from(IndustryDemand).where(IndustryDemand.district_id == district_id)
        total_demand = self.db.scalar(demand_stmt) or 0

        # Providers in district
        provider_stmt = select(func.count()).select_from(TrainingProvider).where(
            TrainingProvider.district_id == district_id,
            TrainingProvider.verification_status == "verified",
        )
        verified_providers = self.db.scalar(provider_stmt) or 0

        # Course offerings in district
        offering_stmt = select(func.count()).select_from(CourseOffering).where(CourseOffering.district_id == district_id)
        offerings = self.db.scalar(offering_stmt) or 0

        # Total capacity
        capacity_stmt = select(func.sum(CourseOffering.active_seats)).where(CourseOffering.district_id == district_id)
        total_capacity = self.db.scalar(capacity_stmt) or 0

        if verified_providers == 0:
            status = "NO_PROVIDER"
        elif offerings == 0:
            status = "NO_COURSE"
        elif total_capacity == 0:
            status = "ZERO_CAPACITY"
        elif total_demand == 0:
            status = "INSUFFICIENT_DATA"
        elif total_capacity >= total_demand:
            status = "CAPACITY_SUFFICIENT"
        else:
            status = "CAPACITY_GAP"

        return {
            "district_id": district_id,
            "district_name": district.name,
            "total_demand": total_demand,
            "verified_providers": verified_providers,
            "course_offerings": offerings,
            "total_capacity": total_capacity,
            "capacity_status": status,
        }


class EquipmentGapService:
    """Calculate equipment gaps for recommended courses."""

    def __init__(self, db: Session):
        self.db = db

    def get_course_equipment_gap(self, course_id: str, district_id: str | None = None) -> dict[str, Any]:
        """Calculate equipment availability for a course in a district."""
        course = self.db.get(Course, course_id)
        if not course:
            return {"error": "Course not found"}

        requirements = self.db.scalars(
            select(CourseEquipmentRequirement).where(CourseEquipmentRequirement.course_id == course_id)
        ).all()

        if not requirements:
            return {
                "course_id": course_id,
                "course_title": course.title,
                "status": "INSUFFICIENT_DATA",
                "reason": "No equipment requirements defined for this course",
                "equipment": [],
            }

        equipment_details = []
        for req in requirements:
            equipment = self.db.get(Equipment, req.equipment_id)
            if not equipment:
                equipment_details.append({
                    "equipment_id": str(req.equipment_id),
                    "required_quantity": req.required_quantity,
                    "available_quantity": None,
                    "status": "INSUFFICIENT_DATA",
                })
                continue

            if district_id and str(equipment.district_id) != district_id:
                equipment_details.append({
                    "equipment_id": str(req.equipment_id),
                    "equipment_name": equipment.name,
                    "required_quantity": req.required_quantity,
                    "available_quantity": None,
                    "status": "INSUFFICIENT_DATA",
                })
                continue

            available = equipment.available_quantity
            if available >= req.required_quantity:
                status = "AVAILABLE"
            elif available > 0:
                status = "PARTIAL"
            else:
                status = "MISSING"

            equipment_details.append({
                "equipment_id": str(req.equipment_id),
                "equipment_name": equipment.name,
                "required_quantity": req.required_quantity,
                "available_quantity": available,
                "status": status,
            })

        overall = "AVAILABLE"
        for detail in equipment_details:
            if detail["status"] == "MISSING":
                overall = "MISSING"
                break
            elif detail["status"] == "PARTIAL":
                overall = "PARTIAL"
            elif detail["status"] == "INSUFFICIENT_DATA" and overall == "AVAILABLE":
                overall = "INSUFFICIENT_DATA"

        return {
            "course_id": course_id,
            "course_title": course.title,
            "status": overall,
            "equipment": equipment_details,
        }


class TrainerGapService:
    """Calculate trainer skill gaps for courses."""

    def __init__(self, db: Session):
        self.db = db

    def get_course_trainer_gap(self, course_id: str) -> dict[str, Any]:
        """Calculate trainer skill coverage for a course."""
        course = self.db.get(Course, course_id)
        if not course:
            return {"error": "Course not found"}

        required_skills = list({cs.skill_id for cs in course.course_skills})
        if not required_skills:
            return {
                "course_id": course_id,
                "course_title": course.title,
                "status": "INSUFFICIENT_DATA",
                "reason": "No course skills defined",
                "trainers": [],
            }

        # Find trainers associated with this course via provider
        providers = self.db.scalars(
            select(TrainingProvider).join(CourseOffering).where(
                CourseOffering.course_id == course_id
            ).distinct()
        ).unique().all()

        if not providers:
            return {
                "course_id": course_id,
                "course_title": course.title,
                "status": "NO_TRAINER_DATA",
                "reason": "No providers offering this course",
                "required_skills": [str(sid) for sid in required_skills],
                "trainers": [],
            }

        trainer_ids = []
        for provider in providers:
            trainers = self.db.scalars(select(Trainer).where(Trainer.provider_id == provider.id)).all()
            trainer_ids.extend([t.id for t in trainers])

        if not trainer_ids:
            return {
                "course_id": course_id,
                "course_title": course.title,
                "status": "NO_TRAINER_DATA",
                "reason": "No trainers assigned to providers offering this course",
                "required_skills": [str(sid) for sid in required_skills],
                "trainers": [],
            }

        trainer_skills = (
            self.db.scalars(
                select(TrainerSkill).where(
                    TrainerSkill.trainer_id.in_(trainer_ids),
                    TrainerSkill.skill_id.in_(required_skills),
                )
            )
            .unique()
            .all()
        )

        covered_skill_ids = {ts.skill_id for ts in trainer_skills}
        missing_skill_ids = set(required_skills) - covered_skill_ids

        if not missing_skill_ids:
            status = "TRAINER_READY"
        elif covered_skill_ids:
            status = "TRAINER_SKILL_GAP"
        else:
            status = "NO_TRAINER_DATA"

        trainers = []
        for trainer_id in trainer_ids:
            trainer = self.db.get(Trainer, trainer_id)
            if not trainer:
                continue
            skills = self.db.scalars(select(TrainerSkill).where(TrainerSkill.trainer_id == trainer_id)).all()
            trainers.append({
                "trainer_id": str(trainer.id),
                "name": trainer.name,
                "skills": [str(ts.skill_id) for ts in skills],
            })

        return {
            "course_id": course_id,
            "course_title": course.title,
            "status": status,
            "required_skills": [str(sid) for sid in required_skills],
            "covered_skills": [str(sid) for sid in covered_skill_ids],
            "missing_skills": [str(sid) for sid in missing_skill_ids],
            "trainers": trainers,
        }


class CurriculumProposalService:
    """Handle curriculum update proposals and approval workflow."""

    def __init__(self, db: Session):
        self.db = db

    def create_proposal(self, curriculum_version_id: str, course_id: str, proposed_by_user_id: str | None, proposed_changes: dict | None, reason: str | None) -> dict[str, Any]:
        """Create a new curriculum proposal."""
        proposal = CurriculumProposal(
            curriculum_version_id=curriculum_version_id,
            course_id=course_id,
            proposed_by_user_id=proposed_by_user_id,
            proposed_changes=proposed_changes,
            reason=reason,
            status="proposed",
        )
        self.db.add(proposal)
        self.db.commit()
        self.db.refresh(proposal)
        return {
            "proposal_id": str(proposal.id),
            "status": proposal.status,
            "created_at": proposal.created_at.isoformat() if proposal.created_at else None,
        }

    def get_proposal(self, proposal_id: str) -> dict[str, Any]:
        """Get a curriculum proposal by ID."""
        proposal = self.db.get(CurriculumProposal, proposal_id)
        if not proposal:
            return {"error": "Proposal not found"}
        return {
            "proposal_id": str(proposal.id),
            "curriculum_version_id": str(proposal.curriculum_version_id),
            "course_id": str(proposal.course_id),
            "status": proposal.status,
            "reason": proposal.reason,
            "review_notes": proposal.review_notes,
            "employer_validated": proposal.employer_validated,
            "implemented_at": proposal.implemented_at.isoformat() if proposal.implemented_at else None,
        }

    def update_proposal_status(self, proposal_id: str, new_status: str, reviewed_by_user_id: str | None, review_notes: str | None) -> dict[str, Any]:
        """Update proposal status (government review)."""
        proposal = self.db.get(CurriculumProposal, proposal_id)
        if not proposal:
            return {"error": "Proposal not found"}

        old_status = proposal.status
        proposal.status = new_status
        proposal.reviewed_by_user_id = reviewed_by_user_id
        proposal.reviewed_at = datetime.now(timezone.utc)
        proposal.review_notes = review_notes

        if new_status == "implemented":
            proposal.implemented_at = datetime.now(timezone.utc)

        self.db.commit()
        self.db.refresh(proposal)

        AuditService(self.db).log(
            actor_user_id=reviewed_by_user_id,
            action="curriculum_proposal_status_update",
            target_type="curriculum_proposal",
            target_id=proposal.id,
            old_status=old_status,
            new_status=new_status,
            reason=review_notes,
        )
        self.db.commit()

        return {
            "proposal_id": str(proposal.id),
            "old_status": old_status,
            "new_status": proposal.status,
            "review_notes": proposal.review_notes,
        }


class EmployerValidationService:
    """Handle employer curriculum validation."""

    def __init__(self, db: Session):
        self.db = db

    def get_course_employer_validations(self, course_id: str) -> dict[str, Any]:
        """Get aggregated employer validations for a course."""
        validations = self.db.scalars(
            select(EmployerCurriculumValidation).where(EmployerCurriculumValidation.course_id == course_id)
        ).all()

        if not validations:
            return {
                "course_id": course_id,
                "validation_status": "NOT_YET_AVAILABLE",
                "reason": "No employer responses for this course",
                "count": 0,
                "aggregated_status": None,
            }

        status_counts: dict[str, int] = {}
        for v in validations:
            status_counts[v.status] = status_counts.get(v.status, 0) + 1

        top = max(status_counts.items(), key=lambda x: x[1])[0]
        return {
            "course_id": course_id,
            "validation_status": "SUPPORTED_BY_CURRENT_DATA",
            "count": len(validations),
            "status_distribution": status_counts,
            "aggregated_status": top,
        }


class DataQualityService:
    """Report data quality metrics for government dashboard."""

    def __init__(self, db: Session):
        self.db = db

    def get_quality_report(self) -> dict[str, Any]:
        """Generate data quality report."""
        total_maharashtra = self.db.scalar(select(func.count()).select_from(IndustryDemand)) or 0

        # Count by source category
        source_counts: dict[str, int] = {}
        rows = self.db.execute(select(DataSource.source_category, func.count()).select_from(DataSource).group_by(DataSource.source_category)).fetchall()
        for category, count in rows:
            source_counts[category or "unknown"] = count or 0

        # Unmapped skills (demands with no matching course skill)
        unmapped_skill_stmt = (
            select(func.count())
            .select_from(IndustryDemand)
            .where(
                ~IndustryDemand.skill_id.in_(
                    select(CourseSkill.skill_id)
                )
            )
        )
        unmapped_skills = self.db.scalar(unmapped_skill_stmt) or 0

        # Unverified providers
        unverified_providers = self.db.scalar(
            select(func.count()).select_from(TrainingProvider).where(TrainingProvider.verification_status == "unverified")
        ) or 0

        # Missing capacity data (no course offerings)
        districts_with_no_offerings = self.db.scalar(
            select(func.count()).select_from(District).where(
                ~District.id.in_(select(CourseOffering.district_id))
            )
        ) or 0

        # Missing trainer data
        providers_with_no_trainers = self.db.scalar(
            select(func.count()).select_from(TrainingProvider).where(
                ~TrainingProvider.id.in_(select(Trainer.provider_id))
            )
        ) or 0

        # Missing equipment data
        providers_with_no_equipment = self.db.scalar(
            select(func.count()).select_from(TrainingProvider).where(
                ~TrainingProvider.id.in_(select(Equipment.provider_id))
            )
        ) or 0

        # Missing employer validation
        courses_with_no_validation = self.db.scalar(
            select(func.count()).select_from(Course).where(
                ~Course.id.in_(select(EmployerCurriculumValidation.course_id))
            )
        ) or 0

        # Missing placement data
        courses_with_no_placements = self.db.scalar(
            select(func.count()).select_from(Course).where(
                ~Course.id.in_(select(CourseEnrollment.course_id).join(Placement, CourseEnrollment.id == Placement.enrollment_id))
            )
        ) or 0

        return {
            "total_demand_observations": total_maharashtra,
            "source_type_distribution": source_counts,
            "unmapped_skills": unmapped_skills,
            "unverified_providers": unverified_providers,
            "districts_with_no_course_offerings": districts_with_no_offerings,
            "providers_with_no_trainers": providers_with_no_trainers,
            "providers_with_no_equipment": providers_with_no_equipment,
            "courses_without_employer_validation": courses_with_no_validation,
            "courses_without_placement_data": courses_with_no_placements,
        }


class AuditService:
    """Immutable audit trail for government and provider actions."""

    def __init__(self, db: Session):
        self.db = db

    def log(self, actor_user_id: str | None, action: str, target_type: str, target_id: str, old_status: str | None = None, new_status: str | None = None, reason: str | None = None, metadata: dict | None = None) -> dict[str, Any]:
        """Write an audit log entry."""
        entry = AuditLog(
            actor_user_id=actor_user_id,
            action=action,
            target_type=target_type,
            target_id=target_id,
            old_status=old_status,
            new_status=new_status,
            reason=reason,
            log_metadata=metadata,
        )
        self.db.add(entry)
        self.db.commit()
        self.db.refresh(entry)
        return {
            "audit_id": str(entry.id),
            "action": entry.action,
            "target_type": entry.target_type,
            "target_id": str(entry.target_id),
            "created_at": entry.created_at.isoformat() if entry.created_at else None,
        }


class EvidenceSourceMapService:
    """Map evidence sources to intelligence outputs for data provenance."""

    def __init__(self, db: Session):
        self.db = db

    def get_evidence_source_map(self) -> dict[str, Any]:
        """Generate evidence source map for all P1 intelligence outputs."""
        from app.models.demand import DataSource
        from app.models.phase6 import IndustryConsultation
        from app.models.phase8 import EmergingTechnology

        # Count records in each evidence source
        evidence_sources = {
            "job_postings": {
                "table": "job_postings",
                "data_available": self.db.scalar(select(func.count()).select_from(JobPosting)) or 0,
                "used_in_demand": True,
                "used_in_skill_gap": True,
                "used_in_recommendations": True,
                "used_in_future_demand": True,
                "used_in_district_planning": True,
            },
            "employer_surveys": {
                "table": "employer_surveys",
                "data_available": self.db.scalar(select(func.count()).select_from(EmployerSurvey)) or 0,
                "used_in_demand": True,
                "used_in_skill_gap": False,
                "used_in_recommendations": False,
                "used_in_future_demand": True,
                "used_in_district_planning": False,
            },
            "industry_consultations": {
                "table": "industry_consultations",
                "data_available": self.db.scalar(select(func.count()).select_from(IndustryConsultation)) or 0,
                "used_in_demand": False,
                "used_in_skill_gap": False,
                "used_in_recommendations": False,
                "used_in_future_demand": False,
                "used_in_district_planning": False,
            },
            "sector_growth_data": {
                "table": None,
                "data_available": 0,
                "used_in_demand": False,
                "used_in_skill_gap": False,
                "used_in_recommendations": False,
                "used_in_future_demand": False,
                "used_in_district_planning": False,
                "note": "Table does not exist - PS gap",
            },
            "placement_outcomes": {
                "table": "placements",
                "data_available": self.db.scalar(select(func.count()).select_from(Placement)) or 0,
                "used_in_demand": False,
                "used_in_skill_gap": False,
                "used_in_recommendations": True,  # In course health
                "used_in_future_demand": False,
                "used_in_district_planning": False,
            },
            "emerging_technologies": {
                "table": "emerging_technologies",
                "data_available": self.db.scalar(select(func.count()).select_from(EmergingTechnology)) or 0,
                "used_in_demand": False,
                "used_in_skill_gap": False,
                "used_in_recommendations": True,  # In course health
                "used_in_future_demand": False,
                "used_in_district_planning": False,
            },
        }

        # Get data source categories
        source_categories = {}
        data_sources = self.db.scalars(select(DataSource)).all()
        for ds in data_sources:
            source_categories[ds.source_category] = source_categories.get(ds.source_category, 0) + 1

        return {
            "evidence_sources": evidence_sources,
            "data_source_categories": source_categories,
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }


class DistrictIntelligenceService:
    """Consolidated district intelligence view."""

    def __init__(self, db: Session):
        self.db = db
        self.course_svc = CourseAlignmentService(db)
        self.provider_svc = TrainingProviderReferenceService(db)
        self.capacity_svc = CapacityGapService(db)
        self.equipment_svc = EquipmentGapService(db)
        self.trainer_svc = TrainerGapService(db)
        self.employer_svc = EmployerValidationService(db)
        self.quality_svc = DataQualityService(db)
        self.evidence_svc = EvidenceSourceMapService(db)

    def get_district_intelligence(self, district_id: str, source_type: str | None = None) -> dict[str, Any]:
        """Get consolidated district intelligence."""
        district = self.db.get(District, district_id)
        if not district:
            return {"error": "District not found"}

        # Demand
        demand_stmt = select(IndustryDemand).where(IndustryDemand.district_id == district_id)
        if source_type:
            demand_stmt = demand_stmt.join(DataSource, IndustryDemand.industry_sector_id == DataSource.id).where(DataSource.source_category == source_type)
        demands = self.db.scalars(demand_stmt.order_by(IndustryDemand.aggregate_demand_score.desc())).unique().all()

        top_skills = []
        for d in demands[:10]:
            skill = self.db.get(Skill, d.skill_id)
            top_skills.append({
                "skill_id": str(d.skill_id),
                "skill_name": skill.name if skill else None,
                "demand_score": d.aggregate_demand_score,
            })

        # Course alignment summary
        alignment = self.course_svc.get_district_course_alignment(district_id, source_type)
        skill_gaps = self.course_svc._extract_skill_gaps(district_id)

        # Recommendations
        recommendations = self.provider_svc.get_source_availability(district_id)

        # Capacity
        capacity = self.capacity_svc.get_district_capacity(district_id)

        # Employer validation for top demanded courses
        employer_validations = []
        for d in demands[:5]:
            if d.job_role_id:
                courses = (
                    self.db.scalars(
                        select(Course)
                        .join(CourseSkill)
                        .where(CourseSkill.skill_id == d.skill_id)
                        .distinct()
                    )
                    .unique()
                    .all()
                )
                for course in courses[:1]:
                    validation = self.employer_svc.get_course_employer_validations(str(course.id))
                    employer_validations.append(validation)

        # Placement outcome
        placement_stmt = select(func.count()).select_from(Placement).where(Placement.district_id == district_id)
        placements = self.db.scalar(placement_stmt) or 0

        # Evidence sources for this district's intelligence
        evidence_map = self.evidence_svc.get_evidence_source_map()

        return {
            "district_id": district_id,
            "district_name": district.name,
            "source_type": source_type,
            "demand": {
                "total_observations": len(demands),
                "top_skills": top_skills,
            },
            "skill_gaps": skill_gaps,
            "course_alignment": alignment,
            "training_recommendations": recommendations[:20],
            "provider_availability": recommendations[:20],
            "capacity": capacity,
            "employer_validation": employer_validations,
            "placements": {"total_placements": placements},
            "review_status": "PENDING_REVIEW",
            "evidence_sources": evidence_map,
        }
