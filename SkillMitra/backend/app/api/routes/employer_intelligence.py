"""Employer Intelligence API - read-only labour market analytics for employers."""
import uuid
from datetime import date, datetime
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select, func, and_
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import require_roles
from app.models.identity import User
from app.models.demand import IndustryDemand, IndustrySector
from app.models.career import JobRole, JobRoleSkill, Course, CourseSkill
from app.models.market import JobPosting
from app.models.identity import CandidateProfile
from app.models.phase4 import CandidateSkill
from app.models.geography import District
from app.models.skills import Skill
from app.services.intelligence_service import IntelligenceService
from pydantic import BaseModel, ConfigDict

router = APIRouter(prefix="/api/v1/employer/intelligence", tags=["Employer Intelligence"])


class DemandResponse(BaseModel):
    total_demand: int
    open_job_postings: int
    districts_covered: int
    top_roles: list[dict]
    top_sectors: list[dict]
    top_skills: list[dict]


class RoleResponse(BaseModel):
    id: str
    title: str
    sector: str | None
    open_postings: int
    demand_count: int
    demand_classification: str | None


class SkillResponse(BaseModel):
    id: str
    name: str
    demand: int
    associated_roles: list[str]
    required_proficiency: str | None
    mapped_training_count: int


class TrendResponse(BaseModel):
    status: str
    message: str | None
    increasing_skills: int
    stable_skills: int
    emerging_skills: int
    trend_direction: str | None
    current_period: str | None
    historical_data: list[dict] | None


class WorkforceResponse(BaseModel):
    status: str
    message: str | None
    candidate_supply: int | None
    skill_supply: int | None
    applications: int | None
    skill_availability: list[dict] | None
    district_distribution: list[dict] | None


class RequirementResponse(BaseModel):
    skill: str
    job_role: str
    importance: str | None
    proficiency: str | None
    demand: int


@router.get("/demand", response_model=DemandResponse)
def get_employer_demand(
    district_id: uuid.UUID | None = Query(None),
    sector_id: uuid.UUID | None = Query(None),
    job_role_id: uuid.UUID | None = Query(None),
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    current_user: User = Depends(require_roles("employer", "industry")),
    db: Session = Depends(get_db),
):
    """Get aggregated demand intelligence for employers."""
    
    # Build base query for industry_demand
    demand_query = select(IndustryDemand)
    
    if district_id:
        demand_query = demand_query.where(IndustryDemand.district_id == district_id)
    if sector_id:
        demand_query = demand_query.where(IndustryDemand.industry_sector_id == sector_id)
    if job_role_id:
        demand_query = demand_query.where(IndustryDemand.job_role_id == job_role_id)
    if date_from:
        demand_query = demand_query.where(IndustryDemand.period_end >= date_from)
    if date_to:
        demand_query = demand_query.where(IndustryDemand.period_start <= date_to)
    
    demand_records = db.scalars(demand_query).all()
    
    # Calculate total demand
    total_demand = sum(record.aggregate_demand_score or 0 for record in demand_records)
    
    # Get open job postings
    job_query = select(JobPosting).where(JobPosting.status == "active")
    if district_id:
        job_query = job_query.where(JobPosting.district_id == district_id)
    if sector_id:
        job_query = job_query.where(JobPosting.job_role_id.in_(
            select(JobRole.id).where(JobRole.industry_sector_id == sector_id)
        ))
    if job_role_id:
        job_query = job_query.where(JobPosting.job_role_id == job_role_id)
    
    open_postings = db.scalar(select(func.count()).select_from(job_query.subquery())) or 0
    
    # Get districts covered
    districts_query = select(IndustryDemand.district_id).distinct()
    if district_id:
        districts_query = districts_query.where(IndustryDemand.district_id == district_id)
    districts_covered = len(db.scalars(districts_query).all())
    
    # Get top roles
    top_roles_query = (
        select(
            JobRole.id,
            JobRole.title,
            func.sum(IndustryDemand.aggregate_demand_score).label("demand_sum")
        )
        .join(IndustryDemand, IndustryDemand.job_role_id == JobRole.id)
        .group_by(JobRole.id, JobRole.title)
        .order_by(func.sum(IndustryDemand.aggregate_demand_score).desc())
        .limit(10)
    )
    
    if district_id:
        top_roles_query = top_roles_query.where(IndustryDemand.district_id == district_id)
    if sector_id:
        top_roles_query = top_roles_query.where(IndustryDemand.industry_sector_id == sector_id)
    
    top_roles = [
        {"id": str(row.id), "title": row.title, "demand": row.demand_sum or 0}
        for row in db.execute(top_roles_query).all()
    ]
    
    # Get top sectors
    top_sectors_query = (
        select(
            IndustrySector.id,
            IndustrySector.name,
            func.sum(IndustryDemand.aggregate_demand_score).label("demand_sum")
        )
        .join(IndustryDemand, IndustryDemand.industry_sector_id == IndustrySector.id)
        .group_by(IndustrySector.id, IndustrySector.name)
        .order_by(func.sum(IndustryDemand.aggregate_demand_score).desc())
        .limit(10)
    )
    
    if district_id:
        top_sectors_query = top_sectors_query.where(IndustryDemand.district_id == district_id)
    
    top_sectors = [
        {"id": str(row.id), "name": row.name, "demand": row.demand_sum or 0}
        for row in db.execute(top_sectors_query).all()
    ]
    
    # Get top skills
    top_skills_query = (
        select(
            Skill.id,
            Skill.name,
            func.sum(IndustryDemand.aggregate_demand_score).label("demand_sum")
        )
        .join(IndustryDemand, IndustryDemand.skill_id == Skill.id)
        .group_by(Skill.id, Skill.name)
        .order_by(func.sum(IndustryDemand.aggregate_demand_score).desc())
        .limit(10)
    )
    
    if district_id:
        top_skills_query = top_skills_query.where(IndustryDemand.district_id == district_id)
    if sector_id:
        top_skills_query = top_skills_query.where(IndustryDemand.industry_sector_id == sector_id)
    
    top_skills = [
        {"id": str(row.id), "name": row.name, "demand": row.demand_sum or 0}
        for row in db.execute(top_skills_query).all()
    ]
    
    return DemandResponse(
        total_demand=int(total_demand),
        open_job_postings=open_postings,
        districts_covered=districts_covered,
        top_roles=top_roles,
        top_sectors=top_sectors,
        top_skills=top_skills,
    )


@router.get("/roles", response_model=list[RoleResponse])
def get_employer_roles(
    district_id: uuid.UUID | None = Query(None),
    sector_id: uuid.UUID | None = Query(None),
    current_user: User = Depends(require_roles("employer", "industry")),
    db: Session = Depends(get_db),
):
    """Get job roles with demand intelligence for employers."""
    
    # Build query for job roles with demand data
    roles_query = (
        select(
            JobRole.id,
            JobRole.title,
            IndustrySector.name.label("sector_name"),
            func.count(JobPosting.id).label("posting_count"),
            func.sum(IndustryDemand.aggregate_demand_score).label("demand_sum")
        )
        .outerjoin(IndustrySector, JobRole.industry_sector_id == IndustrySector.id)
        .outerjoin(JobPosting, and_(JobPosting.job_role_id == JobRole.id, JobPosting.status == "active"))
        .outerjoin(IndustryDemand, IndustryDemand.job_role_id == JobRole.id)
        .where(JobRole.is_active == True)
        .group_by(JobRole.id, JobRole.title, IndustrySector.name)
        .order_by(func.sum(IndustryDemand.aggregate_demand_score).desc())
    )
    
    if district_id:
        roles_query = roles_query.where(
            (JobPosting.district_id == district_id) | (IndustryDemand.district_id == district_id)
        )
    if sector_id:
        roles_query = roles_query.where(JobRole.industry_sector_id == sector_id)
    
    roles_data = db.execute(roles_query).all()
    
    result = []
    for row in roles_data:
        demand_value = row.demand_sum or 0
        # Classify demand based on actual values
        if demand_value >= 100:
            classification = "High"
        elif demand_value >= 50:
            classification = "Moderate"
        elif demand_value > 0:
            classification = "Low"
        else:
            classification = None
        
        result.append(RoleResponse(
            id=str(row.id),
            title=row.title,
            sector=row.sector_name,
            open_postings=row.posting_count or 0,
            demand_count=int(demand_value),
            demand_classification=classification,
        ))
    
    return result


@router.get("/skills", response_model=list[SkillResponse])
def get_employer_skills(
    district_id: uuid.UUID | None = Query(None),
    sector_id: uuid.UUID | None = Query(None),
    current_user: User = Depends(require_roles("employer", "industry")),
    db: Session = Depends(get_db),
):
    """Get skills with demand intelligence for employers."""
    
    # Build query for skills with demand data
    skills_query = (
        select(
            Skill.id,
            Skill.name,
            func.sum(IndustryDemand.aggregate_demand_score).label("demand_sum"),
            func.count(JobRoleSkill.id).label("role_count"),
            func.count(CourseSkill.id).label("course_count")
        )
        .outerjoin(IndustryDemand, IndustryDemand.skill_id == Skill.id)
        .outerjoin(JobRoleSkill, JobRoleSkill.skill_id == Skill.id)
        .outerjoin(CourseSkill, CourseSkill.skill_id == Skill.id)
        .where(Skill.is_active == True)
        .group_by(Skill.id, Skill.name)
        .order_by(func.sum(IndustryDemand.aggregate_demand_score).desc())
    )
    
    if district_id:
        skills_query = skills_query.where(IndustryDemand.district_id == district_id)
    if sector_id:
        skills_query = skills_query.where(IndustryDemand.industry_sector_id == sector_id)
    
    skills_data = db.execute(skills_query).all()
    
    result = []
    for row in skills_data:
        # Get associated role names
        role_names_query = (
            select(JobRole.title)
            .join(JobRoleSkill, JobRoleSkill.job_role_id == JobRole.id)
            .where(JobRoleSkill.skill_id == row.id)
        )
        role_names = [r[0] for r in db.execute(role_names_query).all()]
        
        result.append(SkillResponse(
            id=str(row.id),
            name=row.name,
            demand=int(row.demand_sum or 0),
            associated_roles=role_names[:5],  # Limit to top 5 roles
            required_proficiency=None,  # Could be derived from job_posting_skills if needed
            mapped_training_count=row.course_count or 0,
        ))
    
    return result


@router.get("/trends", response_model=TrendResponse)
def get_employer_trends(
    district_id: uuid.UUID | None = Query(None),
    sector_id: uuid.UUID | None = Query(None),
    skill_id: uuid.UUID | None = Query(None),
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    current_user: User = Depends(require_roles("employer", "industry")),
    db: Session = Depends(get_db),
):
    """Get skill demand trends for employers."""
    
    # Build query for historical demand data
    demand_query = select(IndustryDemand).order_by(IndustryDemand.period_start)
    
    if district_id:
        demand_query = demand_query.where(IndustryDemand.district_id == district_id)
    if sector_id:
        demand_query = demand_query.where(IndustryDemand.industry_sector_id == sector_id)
    if skill_id:
        demand_query = demand_query.where(IndustryDemand.skill_id == skill_id)
    if date_from:
        demand_query = demand_query.where(IndustryDemand.period_end >= date_from)
    if date_to:
        demand_query = demand_query.where(IndustryDemand.period_start <= date_to)
    
    demand_records = db.scalars(demand_query).all()
    
    if len(demand_records) < 2:
        return TrendResponse(
            status="insufficient_evidence",
            message="Insufficient labour-market evidence for trend calculation",
            increasing_skills=0,
            stable_skills=0,
            emerging_skills=0,
            trend_direction=None,
            current_period=None,
            historical_data=None,
        )
    
    # Group by period to get historical data
    historical_data = {}
    for record in demand_records:
        period_key = f"{record.period_start}_{record.period_end}"
        if period_key not in historical_data:
            historical_data[period_key] = {
                "period_start": record.period_start.isoformat() if record.period_start else None,
                "period_end": record.period_end.isoformat() if record.period_end else None,
                "demand_value": 0,
            }
        historical_data[period_key]["demand_value"] += record.aggregate_demand_score or 0
    
    # Convert to sorted list
    historical_list = sorted(
        historical_data.values(),
        key=lambda x: x["period_start"] or ""
    )
    
    # Calculate trend if we have at least 2 periods
    if len(historical_list) >= 2:
        current_demand = historical_list[-1]["demand_value"]
        previous_demand = historical_list[-2]["demand_value"]
        
        if previous_demand > 0:
            change_percent = ((current_demand - previous_demand) / previous_demand) * 100
            
            # Classify trend
            if change_percent >= 20:
                trend_direction = "Rising"
            elif change_percent >= 5:
                trend_direction = "Growing"
            elif change_percent >= -5:
                trend_direction = "Stable"
            elif change_percent >= -20:
                trend_direction = "Declining"
            else:
                trend_direction = "Falling"
        else:
            trend_direction = "Insufficient Data"
    else:
        trend_direction = "Insufficient Data"
    
    # Calculate skill classifications based on recent trends
    increasing_skills = 0
    stable_skills = 0
    emerging_skills = 0
    
    # Simple classification based on recent data
    if historical_list:
        recent_demand = historical_list[-1]["demand_value"]
        if recent_demand > 100:
            increasing_skills = len([r for r in demand_records if (r.aggregate_demand_score or 0) > 50])
        elif recent_demand > 50:
            stable_skills = len([r for r in demand_records if (r.aggregate_demand_score or 0) > 20])
        else:
            emerging_skills = len([r for r in demand_records if (r.aggregate_demand_score or 0) > 0])
    
    current_period = historical_list[-1]["period_end"] if historical_list else None
    
    return TrendResponse(
        status="available",
        message=None,
        increasing_skills=increasing_skills,
        stable_skills=stable_skills,
        emerging_skills=emerging_skills,
        trend_direction=trend_direction,
        current_period=current_period,
        historical_data=historical_list,
    )


@router.get("/workforce", response_model=WorkforceResponse)
def get_employer_workforce(
    district_id: uuid.UUID | None = Query(None),
    sector_id: uuid.UUID | None = Query(None),
    current_user: User = Depends(require_roles("employer", "industry")),
    db: Session = Depends(get_db),
):
    """Get workforce intelligence for employers."""
    
    # Check if we have sufficient candidate data
    candidate_count = db.scalar(select(func.count()).select_from(CandidateProfile)) or 0
    
    if candidate_count == 0:
        return WorkforceResponse(
            status="insufficient_evidence",
            message="Insufficient workforce evidence - no candidate data available",
            candidate_supply=None,
            skill_supply=None,
            applications=None,
            skill_availability=None,
            district_distribution=None,
        )
    
    # Get candidate supply
    candidate_query = select(func.count()).select_from(CandidateProfile)
    if district_id:
        candidate_query = candidate_query.where(CandidateProfile.district_id == district_id)
    candidate_supply = db.scalar(candidate_query) or 0
    
    # Get skill supply
    skill_query = select(func.count()).select_from(CandidateSkill)
    if district_id:
        skill_query = skill_query.where(
            CandidateSkill.candidate_id.in_(
                select(CandidateProfile.id).where(CandidateProfile.district_id == district_id)
            )
        )
    skill_supply = db.scalar(skill_query) or 0
    
    # Get applications count
    from app.models.market import Application
    application_query = select(func.count()).select_from(Application)
    if district_id:
        application_query = application_query.where(
            Application.job_posting_id.in_(
                select(JobPosting.id).where(JobPosting.district_id == district_id)
            )
        )
    applications = db.scalar(application_query) or 0
    
    # Get skill availability
    skill_availability_query = (
        select(Skill.name, func.count(CandidateSkill.id).label("count"))
        .join(CandidateSkill, CandidateSkill.skill_id == Skill.id)
        .group_by(Skill.id, Skill.name)
        .order_by(func.count(CandidateSkill.id).desc())
        .limit(10)
    )
    
    if district_id:
        skill_availability_query = skill_availability_query.where(
            CandidateSkill.candidate_id.in_(
                select(CandidateProfile.id).where(CandidateProfile.district_id == district_id)
            )
        )
    
    skill_availability = [
        {"skill": row.name, "count": row.count}
        for row in db.execute(skill_availability_query).all()
    ]
    
    # Get district distribution
    from app.models.geography import District
    district_query = (
        select(District.name, func.count(CandidateProfile.id).label("count"))
        .join(CandidateProfile, CandidateProfile.district_id == District.id)
        .group_by(District.id, District.name)
        .order_by(func.count(CandidateProfile.id).desc())
    )
    
    district_distribution = [
        {"district": row.name, "count": row.count}
        for row in db.execute(district_query).all()
    ]
    
    return WorkforceResponse(
        status="available",
        message=None,
        candidate_supply=candidate_supply,
        skill_supply=skill_supply,
        applications=applications,
        skill_availability=skill_availability,
        district_distribution=district_distribution,
    )


@router.get("/requirements", response_model=list[RequirementResponse])
def get_employer_requirements(
    district_id: uuid.UUID | None = Query(None),
    sector_id: uuid.UUID | None = Query(None),
    job_role_id: uuid.UUID | None = Query(None),
    current_user: User = Depends(require_roles("employer", "industry")),
    db: Session = Depends(get_db),
):
    """Get skill requirements for employers based on job postings and demand."""
    
    # Build query for job role skills with demand
    requirements_query = (
        select(
            Skill.name.label("skill"),
            JobRole.title.label("job_role"),
            JobRoleSkill.importance,
            JobRoleSkill.proficiency_level_id,
            func.sum(IndustryDemand.aggregate_demand_score).label("demand_sum")
        )
        .join(JobRoleSkill, JobRoleSkill.skill_id == Skill.id)
        .join(JobRole, JobRoleSkill.job_role_id == JobRole.id)
        .outerjoin(IndustryDemand, and_(
            IndustryDemand.skill_id == Skill.id,
            IndustryDemand.job_role_id == JobRole.id
        ))
        .where(JobRole.is_active == True)
        .group_by(Skill.id, Skill.name, JobRole.id, JobRole.title, JobRoleSkill.importance, JobRoleSkill.proficiency_level_id)
        .order_by(func.sum(IndustryDemand.aggregate_demand_score).desc())
    )
    
    if district_id:
        requirements_query = requirements_query.where(IndustryDemand.district_id == district_id)
    if sector_id:
        requirements_query = requirements_query.where(JobRole.industry_sector_id == sector_id)
    if job_role_id:
        requirements_query = requirements_query.where(JobRole.id == job_role_id)
    
    requirements_data = db.execute(requirements_query).all()
    
    result = []
    for row in requirements_data:
        # Get proficiency level name if available
        proficiency = None
        if row.proficiency_level_id:
            from app.models.skills import SkillProficiencyLevel
            proficiency_level = db.scalar(
                select(SkillProficiencyLevel.name).where(SkillProficiencyLevel.id == row.proficiency_level_id)
            )
            proficiency = proficiency_level
        
        result.append(RequirementResponse(
            skill=row.skill,
            job_role=row.job_role,
            importance=row.importance,
            proficiency=proficiency,
            demand=int(row.demand_sum or 0),
        ))
    
    return result