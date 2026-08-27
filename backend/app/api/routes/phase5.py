"""Phase 5 deterministic intelligence APIs."""
import uuid
from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.auth import require_roles
from app.core.database import get_db
from app.models.identity import User
from app.services.intelligence_service import IntelligenceService
from app.models.phase4 import DistrictTrainingPlan, DistrictTrainingPlanItem

router = APIRouter(prefix="/api/v1/government", tags=["Phase 5 Intelligence"])


@router.get("/demand-evidence")
def demand_evidence(
    district_id: uuid.UUID | None = None,
    skill_id: uuid.UUID | None = None,
    job_role_id: uuid.UUID | None = None,
    proficiency_level_id: uuid.UUID | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    current_user: User = Depends(require_roles("government_admin")),
    db: Session = Depends(get_db),
):
    rows = IntelligenceService(db).demand_evidence(district_id, skill_id, job_role_id, proficiency_level_id, date_from, date_to)
    return [{"district_id": row.district_id, "industry_sector_id": row.industry_sector_id,
             "job_role_id": row.job_role_id, "skill_id": row.skill_id,
             "proficiency_level_id": row.proficiency_level_id,
             "period_start": row.period_start, "period_end": row.period_end,
             "demand_value": row.aggregate_demand_score} for row in rows]


@router.get("/training-supply-by-skill")
def training_supply_by_skill(
    district_id: uuid.UUID | None = None,
    skill_id: uuid.UUID | None = None,
    current_user: User = Depends(require_roles("government_admin")),
    db: Session = Depends(get_db),
):
    return IntelligenceService(db).supply_by_skill(district_id, skill_id)


@router.get("/training-gaps")
def training_gaps(
    district_id: uuid.UUID,
    skill_id: uuid.UUID | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    current_user: User = Depends(require_roles("government_admin")),
    db: Session = Depends(get_db),
):
    return IntelligenceService(db).demand_supply_gaps(district_id, skill_id, date_from, date_to)


@router.get("/course-alignment/{course_id}")
def course_alignment(
    course_id: uuid.UUID,
    district_id: uuid.UUID | None = None,
    current_user: User = Depends(require_roles("government_admin")),
    db: Session = Depends(get_db),
):
    return IntelligenceService(db).course_alignment(course_id, district_id)


@router.get("/placement-outcomes")
def placement_outcomes(
    course_id: uuid.UUID | None = None,
    current_user: User = Depends(require_roles("government_admin")),
    db: Session = Depends(get_db),
):
    return IntelligenceService(db).placement_outcomes(course_id)


@router.get("/trainer-gaps/{provider_id}/{course_id}")
def trainer_gaps(
    provider_id: uuid.UUID,
    course_id: uuid.UUID,
    current_user: User = Depends(require_roles("government_admin")),
    db: Session = Depends(get_db),
):
    return IntelligenceService(db).trainer_gaps(provider_id, course_id)


@router.get("/equipment-gaps/{provider_id}/{course_id}")
def equipment_gaps(
    provider_id: uuid.UUID,
    course_id: uuid.UUID,
    current_user: User = Depends(require_roles("government_admin")),
    db: Session = Depends(get_db),
):
    return IntelligenceService(db).equipment_gaps(provider_id, course_id)


@router.get("/district-plans")
def district_plans(
    district_id: uuid.UUID | None = None,
    current_user: User = Depends(require_roles("government_admin")),
    db: Session = Depends(get_db),
):
    stmt = select(DistrictTrainingPlan)
    if district_id:
        stmt = stmt.where(DistrictTrainingPlan.district_id == district_id)
    plans = db.scalars(stmt).all()
    return [{"id": plan.id, "district_id": plan.district_id, "period_start": plan.period_start,
             "period_end": plan.period_end, "status": plan.status} for plan in plans]


@router.post("/district-plans/generate")
def generate_district_plan(
    district_id: uuid.UUID,
    period_start: date,
    period_end: date,
    current_user: User = Depends(require_roles("government_admin")),
    db: Session = Depends(get_db),
):
    if period_start > period_end:
        from fastapi import HTTPException
        raise HTTPException(status_code=422, detail="period_start must be on or before period_end")
    plan, items = IntelligenceService(db).generate_district_plan(
        district_id, period_start, period_end, current_user.id,
    )
    return {"plan": {"id": plan.id, "district_id": plan.district_id,
                      "period_start": plan.period_start, "period_end": plan.period_end,
                      "status": plan.status}, "items": items,
            "generation_status": "SUPPORTED_BY_CURRENT_DATA" if items else "NOT_YET_AVAILABLE",
            "evidence": "Persisted industry_demand rows and active course offering capacity"}
