"""Government analytics endpoints - RBAC: government_admin."""
import uuid
from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import require_roles
from app.models.identity import User
from app.models.market import Placement
from app.models.market import Application, Placement
from app.models.career import CourseEnrollment
from app.models.phase4 import CourseOffering
from app.models.demand import IndustryDemand
from app.services.training_alignment_service import DistrictRecommendationService, TrainingProviderReferenceService
from app.api.deps import get_pagination
from pydantic import BaseModel, ConfigDict

router = APIRouter(prefix="/api/v1/government", tags=["Government Analytics"])

class PlacementOut(BaseModel):
    id: uuid.UUID
    candidate_id: uuid.UUID
    job_posting_id: uuid.UUID | None = None
    employer_id: uuid.UUID | None = None
    job_role_id: uuid.UUID | None = None
    district_id: uuid.UUID | None = None
    outcome_status: str | None = None
    model_config = ConfigDict(from_attributes=True)

class IndustryDemandOut(BaseModel):
    id: uuid.UUID
    industry_sector_id: uuid.UUID
    job_role_id: uuid.UUID | None = None
    district_id: uuid.UUID | None = None
    aggregate_demand_score: float | None = None
    model_config = ConfigDict(from_attributes=True)

@router.get("/placements", response_model=list[PlacementOut])
def gov_placements(
    district_id: uuid.UUID | None = None,
    job_role_id: uuid.UUID | None = None,
    employer_id: uuid.UUID | None = None,
    outcome_type: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    pagination: dict = Depends(get_pagination),
    current_user: User = Depends(require_roles("government_admin")),
    db: Session = Depends(get_db),
):
    stmt = select(Placement)
    if district_id:
        stmt = stmt.where(Placement.district_id == district_id)
    if job_role_id:
        stmt = stmt.where(Placement.job_role_id == job_role_id)
    if employer_id:
        stmt = stmt.where(Placement.employer_id == employer_id)
    if outcome_type:
        stmt = stmt.where(Placement.outcome_status == outcome_type)
    if date_from:
        stmt = stmt.where(Placement.placement_date >= date_from)
    if date_to:
        stmt = stmt.where(Placement.placement_date <= date_to)
    return db.scalars(stmt.offset(pagination["skip"]).limit(pagination["limit"])).all()

@router.get("/demand", response_model=list[IndustryDemandOut])
def gov_demand(
    district_id: uuid.UUID | None = None,
    industry_sector_id: uuid.UUID | None = None,
    job_role_id: uuid.UUID | None = None,
    skill_id: uuid.UUID | None = None,
    proficiency_level_id: uuid.UUID | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    pagination: dict = Depends(get_pagination),
    current_user: User = Depends(require_roles("government_admin")),
    db: Session = Depends(get_db),
):
    stmt = select(IndustryDemand)
    if district_id:
        stmt = stmt.where(IndustryDemand.district_id == district_id)
    if industry_sector_id:
        stmt = stmt.where(IndustryDemand.industry_sector_id == industry_sector_id)
    if job_role_id:
        stmt = stmt.where(IndustryDemand.job_role_id == job_role_id)
    if skill_id:
        stmt = stmt.where(IndustryDemand.skill_id == skill_id)
    if proficiency_level_id:
        stmt = stmt.where(IndustryDemand.proficiency_level_id == proficiency_level_id)
    if date_from:
        stmt = stmt.where(IndustryDemand.period_end >= date_from)
    if date_to:
        stmt = stmt.where(IndustryDemand.period_start <= date_to)
    return db.scalars(stmt.offset(pagination["skip"]).limit(pagination["limit"])).all()


class PlacementAnalyticsOut(BaseModel):
    enrolled: int
    completed: int
    dropped: int
    applied: int
    placed: int
    placement_rate: float | None = None
    placement_rate_status: str = "NOT_YET_AVAILABLE"
    placement_rate_reason: str = "No completed enrollments match the requested filters"


@router.get("/placement-analytics", response_model=PlacementAnalyticsOut)
def gov_placement_analytics(
    district_id: uuid.UUID | None = None,
    job_role_id: uuid.UUID | None = None,
    employer_id: uuid.UUID | None = None,
    course_id: uuid.UUID | None = None,
    outcome_type: str | None = None,
    current_user: User = Depends(require_roles("government_admin")),
    db: Session = Depends(get_db),
):
    enrollment_stmt = select(func.count()).select_from(CourseEnrollment)
    application_stmt = select(func.count()).select_from(Application)
    placement_stmt = select(func.count()).select_from(Placement)
    if district_id:
        placement_stmt = placement_stmt.where(Placement.district_id == district_id)
    if job_role_id:
        placement_stmt = placement_stmt.where(Placement.job_role_id == job_role_id)
    if employer_id:
        placement_stmt = placement_stmt.where(Placement.employer_id == employer_id)
    if outcome_type:
        placement_stmt = placement_stmt.where(Placement.outcome_status == outcome_type)
    if course_id:
        enrollment_stmt = enrollment_stmt.where(CourseEnrollment.course_id == course_id)
        placement_stmt = placement_stmt.join(CourseEnrollment, Placement.enrollment_id == CourseEnrollment.id).where(CourseEnrollment.course_id == course_id)
    enrolled = db.scalar(enrollment_stmt) or 0
    completed = db.scalar(enrollment_stmt.where(CourseEnrollment.status == "completed")) or 0
    dropped = db.scalar(enrollment_stmt.where(CourseEnrollment.status == "dropped")) or 0
    applied = db.scalar(application_stmt) or 0
    placed = db.scalar(placement_stmt) or 0
    # Placement rate = placements linked to completed enrollments / completed enrollments.
    rate = (placed / completed) if completed else None
    return PlacementAnalyticsOut(
        enrolled=enrolled, completed=completed, dropped=dropped,
        applied=applied, placed=placed,
        placement_rate=rate,
        placement_rate_status="SUPPORTED_BY_CURRENT_DATA" if completed else "NOT_YET_AVAILABLE",
    )

@router.get("/training-supply")
def gov_training_supply(
    district_id: uuid.UUID | None = None,
    course_id: uuid.UUID | None = None,
    pagination: dict = Depends(get_pagination),
    current_user: User = Depends(require_roles("government_admin")),
    db: Session = Depends(get_db),
):
    stmt = select(CourseOffering)
    if district_id:
        stmt = stmt.where(CourseOffering.district_id == district_id)
    if course_id:
        stmt = stmt.where(CourseOffering.course_id == course_id)
    rows = db.scalars(stmt.offset(pagination["skip"]).limit(pagination["limit"])).all()
    if not rows:
        return {
            "status": "NOT_YET_AVAILABLE",
            "message": "No persisted course offering capacity matches the requested filters.",
        }
    return [{**row.__dict__, "available_seats": max(row.active_seats - row.utilized_seats, 0)} for row in rows]


class DistrictRecommendationOut(BaseModel):
    district_id: str
    district_name: str
    plan_id: str | None = None
    plan_status: str | None = None
    total_recommendations: int
    recommendations: list[dict]


@router.get("/district-recommendations/{district_id}", response_model=DistrictRecommendationOut)
def get_district_recommendations(
    district_id: uuid.UUID,
    current_user: User = Depends(require_roles("government_admin")),
    db: Session = Depends(get_db),
):
    svc = DistrictRecommendationService(db)
    result = svc.get_district_recommendations(str(district_id))
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


class SkillGapSummaryOut(BaseModel):
    district_id: str
    total_demands: int
    unmatched_count: int
    unmatched_skills: list[dict]


@router.get("/skill-gap-summary/{district_id}", response_model=SkillGapSummaryOut)
def get_skill_gap_summary(
    district_id: uuid.UUID,
    current_user: User = Depends(require_roles("government_admin")),
    db: Session = Depends(get_db),
):
    svc = DistrictRecommendationService(db)
    result = svc.get_skill_gap_summary(str(district_id))
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


class ProviderAvailabilityOut(BaseModel):
    plan_item_id: str
    skill_id: str
    job_role_id: str | None
    source_availability_text: str | None
    course_id: str | None
    recommended_action: str | None
    verification_status: str


@router.get("/provider-availability/{district_id}", response_model=list[ProviderAvailabilityOut])
def get_provider_availability(
    district_id: uuid.UUID,
    job_role_id: uuid.UUID | None = None,
    current_user: User = Depends(require_roles("government_admin")),
    db: Session = Depends(get_db),
):
    svc = TrainingProviderReferenceService(db)
    result = svc.get_source_availability(str(district_id), str(job_role_id) if job_role_id else None)
    return result
