"""Government analytics endpoints - RBAC: government_admin."""
import uuid
from datetime import date, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select, and_, or_
from sqlalchemy.orm import Session, selectinload
from app.core.database import get_db
from app.core.auth import require_roles, require_government_user
from app.models.identity import User
from app.models.market import Application, Placement, JobPosting, JobPostingSkill
from app.models.career import CourseEnrollment, JobRole, CourseSkill
from app.models.phase4 import (
    CourseOffering, DistrictTrainingPlanItem, TrainingProvider,
    CourseEquipmentRequirement, Equipment, Trainer, TrainerSkill, CandidateSkill,
)
from app.models.identity import CandidateProfile
from app.models.phase8 import GovernmentOfficial
from app.models.geography import District
from app.models.career import Course
from app.models.demand import DataSource, IndustryDemand, IndustrySector
from app.models.skills import Skill
from app.services.training_alignment_service import (
    DistrictRecommendationService, TrainingProviderReferenceService,
    CapacityGapService, EquipmentGapService, TrainerGapService,
    CurriculumProposalService, EmployerValidationService,
    DataQualityService, AuditService, DistrictIntelligenceService,
)
from app.api.deps import get_pagination
from app.lib.government_filters import GovernmentFilterParams, build_district_filter, build_sector_filter, build_job_role_filter, build_date_filter
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
    course_count: int = 0


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
    job_role_id: uuid.UUID | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    db: Session = Depends(get_db),
):
    """
    Comprehensive government dashboard with KPIs and intelligence data.
    
    Filters:
    - district_id: Filter by specific district (null = all districts)
    - sector_id: Filter by specific sector (null = all sectors)
    - job_role_id: Filter by specific job role (null = all job roles)
    - start_date: Filter demand by start date (null = no date filter)
    - end_date: Filter demand by end date (null = no date filter)
    
    All filters are applied at the Supabase/PostgreSQL level.
    """
    
    from sqlalchemy import text
    
    # Create filter object
    filters = GovernmentFilterParams(
        district_id=district_id,
        sector_id=sector_id,
        job_role_id=job_role_id,
        start_date=start_date,
        end_date=end_date
    )
    
    # Always use real Supabase data
    # Build filter conditions for Supabase queries
    district_filter = build_district_filter(district_id)
    sector_filter = build_sector_filter(sector_id)
    job_role_filter = build_job_role_filter(job_role_id)
    date_filter = build_date_filter(start_date, end_date)
    
    # Build industry demand query with filters
    demand_query = select(IndustryDemand)
    
    # Apply district filter
    if district_filter["condition"]:
        demand_query = demand_query.where(
            text(district_filter["condition"])
        ).params(**district_filter["params"])
    
    # Apply sector filter
    if sector_filter["condition"]:
        demand_query = demand_query.where(
            text(sector_filter["condition"])
        ).params(**sector_filter["params"])
    
    # Apply job role filter
    if job_role_filter["condition"]:
        demand_query = demand_query.where(
            text(job_role_filter["condition"])
        ).params(**job_role_filter["params"])
    
    # Apply date filter
    if date_filter["conditions"]:
        for condition in date_filter["conditions"]:
            demand_query = demand_query.where(text(condition))
        demand_query = demand_query.params(**date_filter["params"])
    
    # Execute filtered demand query
    filtered_demand = db.scalars(demand_query).all()
    
    # Calculate KPIs from filtered data
    total_demand_observations = len(filtered_demand)
    
    # Get skill demand ranking from filtered data
    skill_demand_scores = {}
    for demand in filtered_demand:
        if demand.skill_id:
            skill_demand_scores[demand.skill_id] = skill_demand_scores.get(demand.skill_id, 0) + (demand.aggregate_demand_score or 0)
    
    # High demand skills (top 20% by demand score)
    high_demand_threshold = 0
    if skill_demand_scores:
        sorted_scores = sorted(skill_demand_scores.values(), reverse=True)
        if sorted_scores:
            high_demand_threshold = sorted_scores[len(sorted_scores) // 5] if len(sorted_scores) >= 5 else sorted_scores[0]
    
    high_demand_skills_count = sum(1 for score in skill_demand_scores.values() if score >= high_demand_threshold)
    
    # Get districts covered
    if district_id:
        districts_covered = 1
    else:
        total_districts = db.scalar(select(func.count()).select_from(District)) or 0
        districts_with_demand = len(set(d.district_id for d in filtered_demand if d.district_id))
        districts_covered = districts_with_demand
    
    # Training capacity from course offerings with filters
    capacity_query = select(CourseOffering)
    
    # Apply district filter to capacity
    if district_id:
        capacity_query = capacity_query.where(CourseOffering.district_id == district_id)
    
    # Apply sector filter to capacity (through courses)
    if sector_id:
        capacity_query = capacity_query.join(Course).where(Course.industry_sector_id == sector_id)
    
    course_offerings = db.scalars(capacity_query).all()
    total_capacity = sum(co.active_seats or 0 for co in course_offerings)
    
    # Calculate KPIs
    kpis = DashboardKPIs(
        districts_covered=districts_covered,
        active_demand_signals=total_demand_observations,
        high_demand_skills=high_demand_skills_count,
        critical_skill_gaps=0,  # Will be calculated from quality report
        critical_gap_demand_records=total_demand_observations,
        training_capacity_gaps=max(0, total_demand_observations - total_capacity),
        courses_requiring_review=0,  # Will be calculated from quality report
    )
    
    # Get district intelligence
    district_intelligence = None
    if district_id:
        district = db.scalar(select(District).where(District.id == district_id))
        if district:
            district_intelligence = DashboardDistrictIntelligence(
                district_id=str(district.id),
                district_name=district.name,
                source_type="Supabase",
                total_demand=total_demand_observations,
                verified_providers=len(set(co.provider_id for co in course_offerings if co.provider_id)),
                total_capacity=total_capacity,
                capacity_status="sufficient" if total_capacity >= total_demand_observations else "insufficient",
            )
    else:
        district_intelligence = DashboardDistrictIntelligence(
            district_id="aggregate",
            district_name="All Maharashtra" if not sector_id else f"All Maharashtra - {sector_id}",
            source_type="Supabase",
            total_demand=total_demand_observations,
            verified_providers=len(set(co.provider_id for co in course_offerings if co.provider_id)),
            total_capacity=total_capacity,
            capacity_status="sufficient" if total_capacity >= total_demand_observations else "insufficient",
        )
    
    # Get skill gaps from filtered demand
    skill_gaps = []
    
    # Get top skills by demand score
    top_skill_ids = sorted(skill_demand_scores.items(), key=lambda x: x[1], reverse=True)[:8]
    
    for skill_id, demand_score in top_skill_ids:
        skill = db.scalar(select(Skill).where(Skill.id == skill_id))
        if skill:
            # Check if this skill has training coverage using course_skills table
            skill_courses = db.scalar(
                select(func.count()).select_from(CourseSkill).where(CourseSkill.skill_id == skill_id)
            ) or 0

            skill_gaps.append(
                DashboardSkillGap(
                    skill_id=str(skill_id),
                    skill_name=skill.name,
                    demand_count=demand_score,
                    training_coverage="Available" if skill_courses > 0 else "Limited",
                    gap_signal="High" if demand_score > high_demand_threshold else "Moderate",
                    course_count=skill_courses,
                )
            )
    
    # Training capacity
    training_capacity = DashboardTrainingCapacity(
        district_id=str(district_id) if district_id else "aggregate",
        district_name=district_intelligence.district_name,
        total_demand=total_demand_observations,
        verified_providers=district_intelligence.verified_providers,
        course_offerings=len(course_offerings),
        total_capacity=total_capacity,
        capacity_status=district_intelligence.capacity_status,
    )
    
    return {
        "kpis": kpis,
        "district_intelligence": district_intelligence,
        "skill_gaps": skill_gaps,
        "training_capacity": training_capacity,
        "course_alignment": [],  # Will be implemented separately
        "employer_demand": [],  # Will be implemented separately
        "district_training_plan": None,  # Will be implemented separately
        "filters": filters.get_filter_metadata(),
        "mode": "live"
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
    current_user: User = Depends(require_roles("government_admin", "government_official")),
    db: Session = Depends(get_db),
):
    # Build query with joins to get real data
    stmt = select(
        CourseOffering,
        Course.title.label("course_title"),
        TrainingProvider.name.label("provider_name"),
        District.name.label("district_name"),
        IndustrySector.name.label("sector_name")
    ).join(
        Course, CourseOffering.course_id == Course.id
    ).join(
        TrainingProvider, CourseOffering.provider_id == TrainingProvider.id
    ).join(
        District, CourseOffering.district_id == District.id
    ).outerjoin(
        IndustrySector, Course.industry_sector_id == IndustrySector.id
    )
    
    if district_id:
        stmt = stmt.where(CourseOffering.district_id == district_id)
    if sector_id:
        stmt = stmt.where(Course.industry_sector_id == sector_id)
    if status:
        stmt = stmt.where(CourseOffering.status == status)
    
    results = db.execute(stmt).all()
    
    result = []
    for offering, course_title, provider_name, district_name, sector_name in results:
        
        result.append(
            TrainingProgramOut(
                offering_id=str(offering.id),
                course_id=str(offering.course_id),
                course_title=course_title,
                provider_id=str(offering.provider_id) if offering.provider_id else "",
                provider_name=provider_name,
                district_id=str(offering.district_id) if offering.district_id else "",
                district_name=district_name,
                active_seats=offering.active_seats,
                utilized_seats=offering.utilized_seats,
                available_seats=max(offering.active_seats - offering.utilized_seats, 0),
                status=offering.status,
                sector=sector_name
            )
        )
    
    return result


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


class TrainingCentreOut(BaseModel):
    provider_id: str
    provider_name: str
    district_id: str
    district_name: str
    course_count: int
    trainer_count: int
    equipment_count: int
    total_capacity: int
    filled_seats: int
    available_seats: int
    utilization: float | None = None
    verification_status: str


@router.get("/training-centres", response_model=list[TrainingCentreOut])
def get_training_centres(
    district_id: uuid.UUID | None = None,
    sector_id: uuid.UUID | None = None,
    search: str | None = None,
    capacity_status: str | None = None,
    current_user: User = Depends(require_government_user),
    db: Session = Depends(get_db),
):
    """
    Get training centres derived from training_providers with course_offerings.
    
    Filters:
    - district_id: Filter by district
    - sector_id: Filter by industry sector (through courses)
    - search: Search by provider/centre name
    - capacity_status: Filter by capacity utilisation status (Near Capacity, Healthy, Available, Low Utilisation)
    
    KPI Definitions:
    - Total Centres: COUNT(DISTINCT training_providers.id) with active course_offerings
    - Total Capacity: SUM(course_offerings.active_seats)
    - Filled Seats: SUM(course_offerings.utilized_seats)
    - Available Seats: MAX(active_seats - utilized_seats, 0)
    - Avg Utilisation: Filled Seats / Total Capacity * 100
    """
    
    # Build base query for training providers with course offerings
    provider_query = (
        select(
            TrainingProvider.id,
            TrainingProvider.name,
            TrainingProvider.district_id,
            TrainingProvider.verification_status,
            District.name.label("district_name"),
            func.count(CourseOffering.id).label("course_count"),
            func.count(Trainer.id).label("trainer_count"),
            func.count(Equipment.id).label("equipment_count"),
            func.sum(CourseOffering.active_seats).label("total_capacity"),
            func.sum(CourseOffering.utilized_seats).label("filled_seats"),
        )
        .join(CourseOffering, TrainingProvider.id == CourseOffering.provider_id)
        .join(District, TrainingProvider.district_id == District.id)
        .outerjoin(Trainer, TrainingProvider.id == Trainer.provider_id)
        .outerjoin(Equipment, TrainingProvider.id == Equipment.provider_id)
        .where(CourseOffering.status == "active")
        .group_by(TrainingProvider.id, TrainingProvider.name, TrainingProvider.district_id, 
                  TrainingProvider.verification_status, District.name)
    )
    
    # Apply district filter
    if district_id:
        provider_query = provider_query.where(TrainingProvider.district_id == district_id)
    
    # Apply sector filter (through courses)
    if sector_id:
        provider_query = provider_query.join(
            Course, CourseOffering.course_id == Course.id
        ).where(Course.industry_sector_id == sector_id)
    
    # Apply search filter
    if search:
        search_pattern = f"%{search}%"
        provider_query = provider_query.where(
            TrainingProvider.name.ilike(search_pattern)
        )
    
    # Execute query
    results = db.execute(provider_query).all()
    
    # Process results and calculate derived fields
    centres = []
    for row in results:
        total_capacity = row.total_capacity or 0
        filled_seats = row.filled_seats or 0
        available_seats = max(total_capacity - filled_seats, 0)
        utilization = (filled_seats / total_capacity * 100) if total_capacity > 0 else None
        
        # Apply capacity status filter if specified
        if capacity_status:
            if utilization is None:
                continue
            if capacity_status == "Near Capacity" and utilization < 85:
                continue
            if capacity_status == "Healthy" and not (60 <= utilization < 85):
                continue
            if capacity_status == "Available" and not (30 <= utilization < 60):
                continue
            if capacity_status == "Low Utilisation" and utilization >= 30:
                continue
        
        centres.append(
            TrainingCentreOut(
                provider_id=str(row.id),
                provider_name=row.name,
                district_id=str(row.district_id),
                district_name=row.district_name,
                course_count=row.course_count or 0,
                trainer_count=row.trainer_count or 0,
                equipment_count=row.equipment_count or 0,
                total_capacity=total_capacity,
                filled_seats=filled_seats,
                available_seats=available_seats,
                utilization=utilization,
                verification_status=row.verification_status,
            )
        )
    
    return centres


class GovernmentCandidateOut(BaseModel):
    candidate_id: str
    name: str | None = None
    district_id: str | None = None
    district_name: str | None = None
    current_status: str | None = None
    education_level: str | None = None
    skills: list[str] = []


class GovernmentCandidatesResponse(BaseModel):
    candidates: list[GovernmentCandidateOut]
    total: int
    by_district: list[dict]
    filters: dict | None = None


@router.get("/candidates", response_model=GovernmentCandidatesResponse)
def get_government_candidates(
    district_id: uuid.UUID | None = None,
    sector_id: uuid.UUID | None = None,
    skill_id: uuid.UUID | None = None,
    training_status: str | None = None,
    employment_status: str | None = None,
    current_user: User = Depends(require_government_user),
    db: Session = Depends(get_db),
):
    """
    Get candidates for government analytics with optional filters.
    
    Filters:
    - district_id: Filter by district
    - sector_id: Filter by industry sector
    - skill_id: Filter by skill
    - training_status: Filter by training status
    - employment_status: Filter by employment status
    """
    
    # Build base query for candidate profiles with user relationship
    query = select(CandidateProfile).options(selectinload(CandidateProfile.user))
    
    # Apply district filter
    if district_id:
        query = query.where(CandidateProfile.district_id == district_id)
    
    # Execute query
    profiles = db.scalars(query).all()
    
    # Get all candidate skills in a single query
    profile_ids = [p.id for p in profiles]
    all_candidate_skills = {}
    if profile_ids:
        skills_query = select(CandidateSkill, Skill.name.label("skill_name")).join(
            Skill, CandidateSkill.skill_id == Skill.id
        ).where(CandidateSkill.candidate_id.in_(profile_ids))
        
        skills_results = db.execute(skills_query).all()
        for cs, skill_name in skills_results:
            if cs.candidate_id not in all_candidate_skills:
                all_candidate_skills[cs.candidate_id] = []
            all_candidate_skills[cs.candidate_id].append(skill_name)
    
    candidates = []
    for profile in profiles:
        # Get district name
        district_name = None
        if profile.district_id:
            district = db.get(District, profile.district_id)
            if district:
                district_name = district.name
        
        # Get candidate name from user relationship
        name = None
        if profile.user:
            name = profile.user.full_name
        
        # Get candidate skills from pre-fetched data
        skills = all_candidate_skills.get(profile.id, [])
        
        candidates.append(
            GovernmentCandidateOut(
                candidate_id=str(profile.id),
                name=name,
                district_id=str(profile.district_id) if profile.district_id else None,
                district_name=district_name,
                current_status=profile.current_status,
                education_level=profile.education_level,
                skills=skills,
            )
        )
    
    # Aggregate candidates by district
    district_counts = {}
    for candidate in candidates:
        district_id = candidate.district_id or "unknown"
        district_name = candidate.district_name or "Unknown District"
        if district_id not in district_counts:
            district_counts[district_id] = {
                "district_id": district_id,
                "district_name": district_name,
                "count": 0
            }
        district_counts[district_id]["count"] += 1
    
    by_district = list(district_counts.values())
    
    return GovernmentCandidatesResponse(
        candidates=candidates,
        total=len(candidates),
        by_district=by_district,
        filters={
            "district_id": str(district_id) if district_id else None,
            "sector_id": str(sector_id) if sector_id else None,
            "skill_id": str(skill_id) if skill_id else None,
            "training_status": training_status,
            "employment_status": employment_status,
        }
    )


class EmployerInsightOut(BaseModel):
    district_id: str
    district_name: str
    sector_id: str
    sector_name: str
    job_role_id: str
    job_role_title: str
    posting_count: int
    required_skills: list[str]
    employers: list[dict]


@router.get("/employer-insights", response_model=list[EmployerInsightOut])
def get_employer_insights(
    district_id: uuid.UUID | None = None,
    job_role_id: uuid.UUID | None = None,
    current_user: User = Depends(require_government_user),
    db: Session = Depends(get_db),
):
    """
    Get employer demand insights from job postings and industry demand.
    This provides Government intelligence about employer hiring patterns.
    """
    from app.models.market import JobPosting
    from app.models.career import JobRole
    from app.models.identity import Employer
    from app.models.demand import IndustrySector
    
    # Build query for job postings with joins
    query = select(
        JobPosting,
        District.name.label("district_name"),
        JobRole.title.label("job_role_title"),
        IndustrySector.name.label("sector_name"),
        IndustrySector.id.label("sector_id")
    ).join(
        District, JobPosting.district_id == District.id
    ).join(
        JobRole, JobPosting.job_role_id == JobRole.id
    ).join(
        Employer, JobPosting.employer_id == Employer.id
    ).join(
        IndustrySector, Employer.industry_sector_id == IndustrySector.id
    ).options(
        selectinload(JobPosting.job_posting_skills).selectinload(JobPostingSkill.skill),
        selectinload(JobPosting.employer)
    )
    
    if district_id:
        query = query.where(JobPosting.district_id == district_id)
    if job_role_id:
        query = query.where(JobPosting.job_role_id == job_role_id)
    
    results = db.execute(query).all()
    
    # Group by district and job role
    insights_map = {}
    for posting, district_name, job_role_title, sector_name, sector_id in results:
        key = f"{posting.district_id}:{posting.job_role_id}"
        
        if key not in insights_map:
            insights_map[key] = {
                "district_id": str(posting.district_id) if posting.district_id else "",
                "district_name": district_name or "Unknown District",
                "sector_id": str(sector_id) if sector_id else "",
                "sector_name": sector_name or "Unknown Sector",
                "job_role_id": str(posting.job_role_id) if posting.job_role_id else "",
                "job_role_title": job_role_title or "Unknown Role",
                "posting_count": 0,
                "required_skills": set(),
                "employers": {}
            }
        
        insights_map[key]["posting_count"] += 1
        
        # Add required skills
        if posting.job_posting_skills:
            for jps in posting.job_posting_skills:
                if jps.skill:
                    insights_map[key]["required_skills"].add(jps.skill.name)
        
        # Add employer with company name
        if posting.employer:
            employer_key = str(posting.employer.id)
            if employer_key not in insights_map[key]["employers"]:
                insights_map[key]["employers"][employer_key] = {
                    "employer_id": employer_key,
                    "company_name": posting.employer.company_name or "Unknown Company"
                }
    
    # Convert to response format
    insights = []
    for key, data in insights_map.items():
        insights.append(
            EmployerInsightOut(
                district_id=data["district_id"],
                district_name=data["district_name"],
                sector_id=data["sector_id"],
                sector_name=data["sector_name"],
                job_role_id=data["job_role_id"],
                job_role_title=data["job_role_title"],
                posting_count=data["posting_count"],
                required_skills=list(data["required_skills"]),
                employers=list(data["employers"].values())
            )
        )
    
    return insights


class DemandEvidenceOut(BaseModel):
    district_id: str
    industry_sector_id: str
    job_role_id: str | None
    skill_id: str
    demand_value: float | None


@router.get("/demand-evidence", response_model=list[DemandEvidenceOut])
def get_demand_evidence(
    district_id: uuid.UUID | None = None,
    skill_id: uuid.UUID | None = None,
    job_role_id: uuid.UUID | None = None,
    current_user: User = Depends(require_government_user),
    db: Session = Depends(get_db),
):
    """
    Get demand evidence from industry_demand table.
    This provides evidence-based demand signals for Government analysis.
    """
    query = select(IndustryDemand)
    
    if district_id:
        query = query.where(IndustryDemand.district_id == district_id)
    if skill_id:
        query = query.where(IndustryDemand.skill_id == skill_id)
    if job_role_id:
        query = query.where(IndustryDemand.job_role_id == job_role_id)
    
    demand_records = db.scalars(query).all()
    
    return [
        DemandEvidenceOut(
            district_id=str(record.district_id) if record.district_id else "",
            industry_sector_id=str(record.industry_sector_id) if record.industry_sector_id else "",
            job_role_id=str(record.job_role_id) if record.job_role_id else None,
            skill_id=str(record.skill_id) if record.skill_id else "",
            demand_value=record.aggregate_demand_score
        )
        for record in demand_records
    ]
