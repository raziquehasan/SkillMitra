"""Government analytics endpoints - RBAC: government_admin."""
import uuid
from datetime import date, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import require_roles, require_government_user
from app.models.identity import User
from app.models.market import Application, Placement
from app.models.career import CourseEnrollment
from app.models.phase4 import (
    CourseOffering, DistrictTrainingPlanItem, TrainingProvider,
    CourseEquipmentRequirement, Equipment, Trainer, TrainerSkill,
)
from app.models.phase8 import GovernmentOfficial
from app.models.geography import District
from app.models.career import Course
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


class DashboardKPIs(BaseModel):
    districts_covered: int
    active_demand_signals: int
    high_demand_skills: int
    critical_skill_gaps: int
    critical_gap_demand_records: int
    training_capacity_gaps: int
    courses_requiring_review: int


class DashboardSkillGap(BaseModel):
    skill_id: str
    skill_name: str | None
    demand_count: float | None
    training_coverage: str | None
    gap_signal: str | None


class DashboardTrainingCapacity(BaseModel):
    district_id: str
    district_name: str
    total_demand: int
    verified_providers: int
    course_offerings: int
    total_capacity: int
    capacity_status: str


class DashboardCourseAlignment(BaseModel):
    course_id: str
    course_title: str
    alignment_status: str
    skills_covered: list[str]
    skills_demanded: list[str]
    gaps: list[str]


class DashboardEmployerDemand(BaseModel):
    sector: str | None
    job_role: str | None
    required_skills: list[str]
    posting_count: int


class DashboardRecommendation(BaseModel):
    plan_item_id: str
    skill_id: str
    job_role_id: str | None
    demand_value: int | None
    gap_value: int | None
    recommended_action: str | None
    review_status: str | None
    rationale: str | None
    course_id: str | None


class DashboardTrainingPlan(BaseModel):
    district_id: str
    district_name: str
    plan_id: str
    plan_status: str
    total_recommendations: int
    recommendations: list[DashboardRecommendation]


class DashboardDistrictIntelligence(BaseModel):
    district_id: str
    district_name: str
    source_type: str | None
    total_demand: int
    verified_providers: int
    total_capacity: int
    capacity_status: str


class DashboardResponse(BaseModel):
    kpis: DashboardKPIs
    district_intelligence: DashboardDistrictIntelligence | None
    skill_gaps: list[DashboardSkillGap]
    training_capacity: DashboardTrainingCapacity | None
    course_alignment: list[DashboardCourseAlignment]
    employer_demand: list[DashboardEmployerDemand]
    district_training_plan: DashboardTrainingPlan | None


class GovernmentNotificationOut(BaseModel):
    id: str
    title: str
    message: str
    severity: str
    timestamp: datetime
    read: bool = False
    related_module: str | None = None
    navigation_url: str | None = None


@router.get("/notifications", response_model=list[GovernmentNotificationOut])
def get_government_notifications(
    current_user: User = Depends(require_government_user),
    db: Session = Depends(get_db),
):
    """Return recent platform alerts and operational notifications for government users (demo data)."""
    return [
        {
            "id": "notif-001",
            "title": "Maharashtra Placement Pulse Updated",
            "message": "Placement analytics were refreshed for the latest reporting cycle.",
            "severity": "info",
            "timestamp": datetime.now(timezone.utc),
            "read": False,
            "related_module": "placement-analytics",
            "navigation_url": "/government/placement-analytics",
        },
        {
            "id": "notif-002",
            "title": "Training capacity review required",
            "message": "Three districts are below recommended provider coverage for high-demand courses.",
            "severity": "warning",
            "timestamp": datetime.now(timezone.utc),
            "read": False,
            "related_module": "training-capacity",
            "navigation_url": "/government/training-capacity",
        },
        {
            "id": "notif-003",
            "title": "Demand signal alert",
            "message": "CNC operator demand remains elevated across Nashik and Pune districts.",
            "severity": "critical",
            "timestamp": datetime.now(timezone.utc),
            "read": True,
            "related_module": "skill-demand",
            "navigation_url": "/government/skill-demand",
        },
    ]


class GovernmentProfileOut(BaseModel):
    id: str
    email: str
    full_name: str
    phone: str | None
    roles: list[str]
    department: str | None
    designation: str | None
    district_id: str | None
    district_name: str | None
    employee_code: str | None
    verification_status: str | None
    last_login_at: str | None
    created_at: str


@router.get("/profile", response_model=GovernmentProfileOut)
def get_government_profile(
    current_user: User = Depends(require_government_user),
    db: Session = Depends(get_db),
):
    """Get the authenticated government user's profile - REAL data only, NO demo/fallback."""
    try:
        # Get the government official profile for the authenticated user
        gov_official = db.scalar(
            select(GovernmentOfficial).where(GovernmentOfficial.user_id == current_user.id)
        )

        # Get user roles
        roles = [ur.role.name for ur in current_user.user_roles]

        # Get district name if district_id exists
        district_name = None
        if gov_official and gov_official.district_id:
            district = db.get(District, gov_official.district_id)
            if district:
                district_name = district.name

        return GovernmentProfileOut(
            id=str(current_user.id),
            email=current_user.email,
            full_name=current_user.full_name,
            phone=current_user.phone,
            roles=roles,
            department=gov_official.department if gov_official else None,
            designation=gov_official.designation if gov_official else None,
            district_id=str(gov_official.district_id) if gov_official and gov_official.district_id else None,
            district_name=district_name,
            employee_code=gov_official.employee_code if gov_official else None,
            verification_status=gov_official.verification_status if gov_official else None,
            last_login_at=current_user.last_login_at.isoformat() if current_user.last_login_at else None,
            created_at=current_user.created_at.isoformat() if current_user.created_at else None,
        )
    except Exception as e:
        # Log the error for debugging
        print(f"Error loading government profile: {e}")
        raise HTTPException(
            status_code=500,
            detail="Unable to load your profile. Please try again or contact support."
        )


@router.get("/dashboard", response_model=DashboardResponse)
def get_government_dashboard(
    district_id: uuid.UUID | None = None,
    sector_id: uuid.UUID | None = None,
    db: Session = Depends(get_db),
):
    """Comprehensive government dashboard with KPIs and intelligence data."""
    
    # Demo data matching the original dashboard design
    demo_skill_gaps = [
        {"skill_id": "skill-1", "skill_name": "Electrical Technology", "demand_count": 8.5, "training_coverage": "Limited", "gap_signal": "High"},
        {"skill_id": "skill-2", "skill_name": "CNC Machine Operation", "demand_count": 7.2, "training_coverage": "Available", "gap_signal": "Moderate"},
        {"skill_id": "skill-3", "skill_name": "Industrial Safety", "demand_count": 6.8, "training_coverage": "Available", "gap_signal": "Low"},
        {"skill_id": "skill-4", "skill_name": "EV Technology", "demand_count": 6.5, "training_coverage": "Limited", "gap_signal": "High"},
        {"skill_id": "skill-5", "skill_name": "Python Programming", "demand_count": 6.2, "training_coverage": "Available", "gap_signal": "Moderate"},
        {"skill_id": "skill-6", "skill_name": "Diagnostics", "demand_count": 5.8, "training_coverage": "Limited", "gap_signal": "High"},
        {"skill_id": "skill-7", "skill_name": "Digital Tools", "demand_count": 5.5, "training_coverage": "Available", "gap_signal": "Low"},
        {"skill_id": "skill-8", "skill_name": "Solar Installation", "demand_count": 5.2, "training_coverage": "Limited", "gap_signal": "Moderate"},
    ]
    
    demo_training_capacity = {
        "district_id": "demo-district",
        "district_name": "All Maharashtra",
        "source_type": "job_postings",
        "total_demand": 52000,
        "verified_providers": 145,
        "course_offerings": 89,
        "total_capacity": 38000,
        "capacity_status": "insufficient"
    }
    
    demo_course_alignment = [
        {
            "course_id": "course-1",
            "course_title": "Advanced Electrical Systems",
            "alignment_status": "aligned",
            "skills_covered": ["Electrical Technology", "Industrial Safety"],
            "skills_demanded": ["Electrical Technology", "Industrial Safety", "CNC Operation"],
            "gaps": ["CNC Operation"]
        },
        {
            "course_id": "course-2",
            "course_title": "Python for Data Science",
            "alignment_status": "aligned",
            "skills_covered": ["Python Programming", "Digital Tools"],
            "skills_demanded": ["Python Programming", "Digital Tools", "Machine Learning"],
            "gaps": ["Machine Learning"]
        }
    ]
    
    demo_employer_demand = [
        {"sector": "Manufacturing", "job_role": "CNC Operator", "required_skills": ["CNC Machine Operation", "Industrial Safety"], "posting_count": 2500},
        {"sector": "Automotive", "job_role": "EV Technician", "required_skills": ["EV Technology", "Electrical Technology"], "posting_count": 1800},
        {"sector": "IT", "job_role": "Python Developer", "required_skills": ["Python Programming", "Digital Tools"], "posting_count": 1200},
        {"sector": "Renewable Energy", "job_role": "Solar Installer", "required_skills": ["Solar Installation", "Electrical Technology"], "posting_count": 900}
    ]
    
    return {
        "kpis": {
            "districts_covered": 36,
            "active_demand_signals": 52000,
            "high_demand_skills": 15,
            "critical_skill_gaps": 8,
            "critical_gap_demand_records": 14000,
            "training_capacity_gaps": 4,
            "courses_requiring_review": 12
        },
        "district_intelligence": demo_training_capacity,
        "skill_gaps": demo_skill_gaps,
        "training_capacity": demo_training_capacity,
        "course_alignment": demo_course_alignment,
        "employer_demand": demo_employer_demand,
        "district_training_plan": None
    }

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


class TrainingProgramOut(BaseModel):
    offering_id: str
    course_id: str
    course_title: str
    provider_id: str
    provider_name: str
    district_id: str
    district_name: str
    active_seats: int
    utilized_seats: int
    available_seats: int
    status: str
    sector: str | None
    model_config = ConfigDict(from_attributes=True)


@router.get("/training-programs", response_model=list[TrainingProgramOut])
def get_training_programs(
    district_id: uuid.UUID | None = None,
    sector_id: uuid.UUID | None = None,
    status: str | None = None,
    current_user: User = Depends(require_roles("government_admin")),
    db: Session = Depends(get_db),
):
    stmt = select(CourseOffering)
    if district_id:
        stmt = stmt.where(CourseOffering.district_id == district_id)
    if sector_id:
        stmt = stmt.join(Course, CourseOffering.course_id == Course.id).where(Course.industry_sector_id == sector_id)
    if status:
        stmt = stmt.where(CourseOffering.status == status)
    
    offerings = db.scalars(stmt).all()
    
    return [
        TrainingProgramOut(
            offering_id=str(offering.id),
            course_id=str(offering.course_id),
            course_title="Course Title",  # Would need to join with courses table
            provider_id=str(offering.provider_id) if offering.provider_id else "",
            provider_name="Provider Name",  # Would need to join with providers table
            district_id=str(offering.district_id) if offering.district_id else "",
            district_name="District Name",  # Would need to join with districts table
            active_seats=offering.active_seats,
            utilized_seats=offering.utilized_seats,
            available_seats=max(offering.active_seats - offering.utilized_seats, 0),
            status=offering.status,
            sector="Sector"  # Would need to join with courses/sectors table
        )
        for offering in offerings
    ]


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
