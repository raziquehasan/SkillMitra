"""Deterministic Phase 5 labour-market and training-supply analytics."""
from datetime import date
import uuid
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.models.career import Course, CourseEnrollment, CourseSkill, JobRoleSkill
from app.models.career import Course as CourseModel
from app.models.demand import IndustryDemand, DemandSignal
from app.models.market import Application, Placement
from app.models.phase4 import (
    CourseEquipmentRequirement, CourseOffering, Curriculum, CurriculumSkill, CurriculumVersion,
    DistrictTrainingPlan, DistrictTrainingPlanItem, Equipment, Trainer, TrainerSkill,
)
from app.models.skills import SkillProficiencyLevel


class IntelligenceService:
    def __init__(self, db: Session):
        self.db = db

    def demand_evidence(self, district_id=None, skill_id=None, job_role_id=None,
                        proficiency_level_id=None, date_from: date | None = None,
                        date_to: date | None = None):
        stmt = select(IndustryDemand).order_by(IndustryDemand.aggregate_demand_score.desc())
        filters = ((IndustryDemand.district_id, district_id), (IndustryDemand.skill_id, skill_id),
                   (IndustryDemand.job_role_id, job_role_id),
                   (IndustryDemand.proficiency_level_id, proficiency_level_id))
        for column, value in filters:
            if value:
                stmt = stmt.where(column == value)
        if date_from:
            stmt = stmt.where(IndustryDemand.period_end >= date_from)
        if date_to:
            stmt = stmt.where(IndustryDemand.period_start <= date_to)
        return self.db.scalars(stmt).all()

    def supply_by_skill(self, district_id=None, skill_id=None):
        stmt = (
            select(CourseSkill.skill_id, func.sum(CourseOffering.active_seats - CourseOffering.utilized_seats))
            .join(CourseOffering, CourseOffering.course_id == CourseSkill.course_id)
            .where(CourseOffering.status == "active")
            .group_by(CourseSkill.skill_id)
        )
        if district_id:
            stmt = stmt.where(CourseOffering.district_id == district_id)
        if skill_id:
            stmt = stmt.where(CourseSkill.skill_id == skill_id)
        return [{"skill_id": row[0], "available_capacity": max(row[1] or 0, 0)} for row in self.db.execute(stmt)]

    def demand_supply_gaps(self, district_id, skill_id=None, date_from=None, date_to=None):
        demand_rows = self.demand_evidence(district_id=district_id, skill_id=skill_id,
                                           date_from=date_from, date_to=date_to)
        supply = {row["skill_id"]: row["available_capacity"] for row in self.supply_by_skill(district_id, skill_id)}
        results = []
        for row in demand_rows:
            available = supply.get(row.skill_id, 0)
            results.append({
                "district_id": row.district_id, "industry_sector_id": row.industry_sector_id,
                "job_role_id": row.job_role_id, "skill_id": row.skill_id,
                "proficiency_level_id": row.proficiency_level_id,
                "period_start": row.period_start, "period_end": row.period_end,
                "demand_value": row.aggregate_demand_score,
                "available_capacity": available,
                "capacity_gap": row.aggregate_demand_score - available,
                "capacity_definition": "active seats minus utilized seats across active course offerings covering the skill",
            })
        return results

    def course_alignment(self, course_id: uuid.UUID, district_id=None):
        demanded = set(row.skill_id for row in self.demand_evidence(district_id=district_id))
        course_skills = set(self.db.scalars(select(CourseSkill.skill_id).where(CourseSkill.course_id == course_id)).all())
        covered = demanded & course_skills
        uncovered = demanded - course_skills
        return {
            "course_id": course_id,
            "demanded_skill_ids": sorted(demanded, key=str),
            "covered_skill_ids": sorted(covered, key=str),
            "uncovered_skill_ids": sorted(uncovered, key=str),
            "coverage_count": len(covered),
            "alignment_status": "ALIGNED" if demanded and not uncovered else "PARTIALLY_ALIGNED" if covered else "INSUFFICIENT_DATA",
        }

    def placement_outcomes(self, course_id=None):
        enrollment = select(CourseEnrollment.id).where(CourseEnrollment.status == "completed")
        if course_id:
            enrollment = enrollment.where(CourseEnrollment.course_id == course_id)
        completed = self.db.scalar(select(func.count()).select_from(enrollment.subquery())) or 0
        placement_stmt = select(func.count()).select_from(Placement).where(Placement.enrollment_id.in_(enrollment))
        placed = self.db.scalar(placement_stmt) or 0
        applied_stmt = select(func.count()).select_from(Application)
        applied = self.db.scalar(applied_stmt) or 0
        enrolled_stmt = select(func.count()).select_from(CourseEnrollment)
        if course_id:
            enrolled_stmt = enrolled_stmt.where(CourseEnrollment.course_id == course_id)
        enrolled = self.db.scalar(enrolled_stmt) or 0
        return {
            "enrolled_count": enrolled, "completed_count": completed,
            "application_count": applied, "placement_count": placed,
            "placement_rate": placed / completed if completed else None,
            "placement_rate_status": "SUPPORTED_BY_CURRENT_DATA" if completed else "NOT_YET_AVAILABLE",
            "placement_rate_numerator": placed, "placement_rate_denominator": completed,
        }

    def trainer_gaps(self, provider_id: uuid.UUID, course_id: uuid.UUID):
        required = self.db.execute(
            select(CurriculumSkill.skill_id, CurriculumSkill.proficiency_level_id)
            .join(CurriculumVersion, CurriculumVersion.id == CurriculumSkill.curriculum_version_id)
            .join(Curriculum, Curriculum.id == CurriculumVersion.curriculum_id)
            .where(Curriculum.course_id == course_id)
        ).all()
        trainers = self.db.scalars(select(Trainer).where(Trainer.provider_id == provider_id, Trainer.status == "active")).all()
        trainer_ids = [trainer.id for trainer in trainers]
        skills = self.db.execute(select(TrainerSkill.skill_id, TrainerSkill.proficiency_level_id).where(TrainerSkill.trainer_id.in_(trainer_ids))).all() if trainer_ids else []
        ranks = dict(self.db.execute(select(SkillProficiencyLevel.id, SkillProficiencyLevel.rank_score)).all())
        available = {(skill_id, proficiency_id) for skill_id, proficiency_id in skills}
        gaps = []
        for skill_id, required_level in required:
            if not any(candidate_skill == skill_id and ranks.get(candidate_level, 0) >= ranks.get(required_level, 0) for candidate_skill, candidate_level in available):
                gaps.append({"skill_id": skill_id, "required_proficiency_id": required_level, "status": "UPSKILLING_REQUIRED"})
        return gaps

    def equipment_gaps(self, provider_id: uuid.UUID, course_id: uuid.UUID):
        rows = self.db.execute(
            select(CourseEquipmentRequirement, Equipment)
            .join(Equipment, Equipment.id == CourseEquipmentRequirement.equipment_id)
            .where(CourseEquipmentRequirement.course_id == course_id, Equipment.provider_id == provider_id)
        ).all()
        return [{"equipment_id": requirement.equipment_id, "required_quantity": requirement.required_quantity,
                 "available_quantity": equipment.available_quantity, "equipment_gap": max(requirement.required_quantity - equipment.available_quantity, 0)}
                for requirement, equipment in rows]

    def generate_district_plan(self, district_id: uuid.UUID, period_start: date,
                               period_end: date, created_by_user_id: uuid.UUID):
        demand_rows = self.demand_evidence(district_id=district_id, date_from=period_start, date_to=period_end)
        existing = self.db.scalar(select(DistrictTrainingPlan).where(
            DistrictTrainingPlan.district_id == district_id,
            DistrictTrainingPlan.period_start == period_start,
            DistrictTrainingPlan.period_end == period_end,
        ))
        if existing:
            return existing, []
        plan = DistrictTrainingPlan(
            district_id=district_id, period_start=period_start, period_end=period_end,
            created_by_user_id=created_by_user_id,
        )
        self.db.add(plan)
        self.db.flush()
        supply = {row["skill_id"]: row["available_capacity"] for row in self.supply_by_skill(district_id)}
        items = []
        for demand in demand_rows:
            available = supply.get(demand.skill_id, 0)
            gap = demand.aggregate_demand_score - available
            action = "EXPAND_EXISTING_CAPACITY" if gap > 0 else "COLLECT_MORE_DATA"
            item = DistrictTrainingPlanItem(
                plan_id=plan.id, skill_id=demand.skill_id, job_role_id=demand.job_role_id,
                proficiency_level_id=demand.proficiency_level_id,
                demand_value=demand.aggregate_demand_score, supply_value=available,
                gap_value=gap,
            )
            self.db.add(item)
            items.append({"skill_id": demand.skill_id, "job_role_id": demand.job_role_id,
                          "demand_value": demand.aggregate_demand_score,
                          "available_capacity": available, "capacity_gap": gap,
                          "recommended_action": action})
        self.db.commit()
        self.db.refresh(plan)
        return plan, items
