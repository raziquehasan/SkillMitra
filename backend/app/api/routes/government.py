"""Government analytics endpoints - RBAC: government_admin."""
import uuid
from datetime import date, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import require_roles
from app.models.identity import User
from app.models.market import Application, Placement
from app.models.career import CourseEnrollment
from app.models.phase4 import (
    CourseOffering, DistrictTrainingPlanItem, TrainingProvider,
    CourseEquipmentRequirement, Equipment, Trainer, TrainerSkill,
)
from app.models.demand import DataSource, IndustryDemand
from app.services.training_alignment_service import (
    DistrictRecommendationService, TrainingProviderReferenceService,
    CapacityGapService, EquipmentGapService, TrainerGapService,
    CurriculumProposalService, EmployerValidationService,
    DataQualityService, AuditService, DistrictIntelligenceService,
)
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
    source_type: str | None = None,
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
    if source_type:
        stmt = stmt.join(DataSource, IndustryDemand.data_source_id == DataSource.id).where(DataSource.source_category == source_type)
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
    source_type: str | None = None,
    current_user: User = Depends(require_roles("government_admin")),
    db: Session = Depends(get_db),
):
    svc = DistrictRecommendationService(db)
    result = svc.get_district_recommendations(str(district_id), source_type)
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
    source_type: str | None = None,
    current_user: User = Depends(require_roles("government_admin")),
    db: Session = Depends(get_db),
):
    svc = DistrictRecommendationService(db)
    result = svc.get_skill_gap_summary(str(district_id), source_type)
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


class PlanItemReviewIn(BaseModel):
    review_status: str
    review_notes: str | None = None


@router.post("/recommendations/{plan_item_id}/review")
def review_plan_item(
    plan_item_id: uuid.UUID,
    data: PlanItemReviewIn,
    current_user: User = Depends(require_roles("government_admin")),
    db: Session = Depends(get_db),
):
    item = db.get(DistrictTrainingPlanItem, plan_item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Plan item not found")
    item.review_status = data.review_status
    item.review_notes = data.review_notes
    db.commit()
    db.refresh(item)
    AuditService(db).log(
        actor_user_id=str(current_user.id),
        action="plan_item_review",
        target_type="district_training_plan_item",
        target_id=str(item.id),
        old_status=None,
        new_status=data.review_status,
        reason=data.review_notes,
    )
    db.commit()
    return {
        "plan_item_id": str(item.id),
        "review_status": item.review_status,
        "review_notes": item.review_notes,
    }


@router.get("/capacity/{district_id}")
def get_capacity_gap(
    district_id: uuid.UUID,
    current_user: User = Depends(require_roles("government_admin")),
    db: Session = Depends(get_db),
):
    svc = CapacityGapService(db)
    result = svc.get_district_capacity(str(district_id))
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.get("/equipment-gap/{course_id}")
def get_equipment_gap(
    course_id: uuid.UUID,
    district_id: uuid.UUID | None = None,
    current_user: User = Depends(require_roles("government_admin")),
    db: Session = Depends(get_db),
):
    svc = EquipmentGapService(db)
    result = svc.get_course_equipment_gap(str(course_id), str(district_id) if district_id else None)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.get("/trainer-gap/{course_id}")
def get_trainer_gap(
    course_id: uuid.UUID,
    current_user: User = Depends(require_roles("government_admin")),
    db: Session = Depends(get_db),
):
    svc = TrainerGapService(db)
    result = svc.get_course_trainer_gap(str(course_id))
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.get("/district-intelligence/{district_id}")
def get_district_intelligence(
    district_id: uuid.UUID,
    source_type: str | None = None,
    current_user: User = Depends(require_roles("government_admin")),
    db: Session = Depends(get_db),
):
    svc = DistrictIntelligenceService(db)
    result = svc.get_district_intelligence(str(district_id), source_type)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.get("/data-quality")
def get_data_quality(
    current_user: User = Depends(require_roles("government_admin")),
    db: Session = Depends(get_db),
):
    svc = DataQualityService(db)
    return svc.get_quality_report()


@router.get("/employer-validation/{course_id}")
def get_employer_validation(
    course_id: uuid.UUID,
    current_user: User = Depends(require_roles("government_admin")),
    db: Session = Depends(get_db),
):
    svc = EmployerValidationService(db)
    result = svc.get_course_employer_validations(str(course_id))
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


class ProviderVerifyIn(BaseModel):
    verification_status: str
    review_notes: str | None = None


@router.post("/providers/{provider_id}/verify")
def verify_provider(
    provider_id: uuid.UUID,
    data: ProviderVerifyIn,
    current_user: User = Depends(require_roles("government_admin")),
    db: Session = Depends(get_db),
):
    provider = db.get(TrainingProvider, provider_id)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    provider.verification_status = data.verification_status
    provider.reviewed_by_user_id = current_user.id
    provider.reviewed_at = datetime.now(timezone.utc)
    provider.review_notes = data.review_notes
    db.commit()
    db.refresh(provider)
    AuditService(db).log(
        actor_user_id=str(current_user.id),
        action="provider_verification",
        target_type="training_provider",
        target_id=str(provider.id),
        old_status="unverified",
        new_status=data.verification_status,
        reason=data.review_notes,
    )
    db.commit()
    return {
        "provider_id": str(provider.id),
        "verification_status": provider.verification_status,
        "reviewed_at": provider.reviewed_at.isoformat() if provider.reviewed_at else None,
        "review_notes": provider.review_notes,
    }
