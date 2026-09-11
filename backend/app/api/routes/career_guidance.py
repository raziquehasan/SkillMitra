from app.models.demand import IndustryDemand
from app.models.career import Course, CourseSkill
"""
Career Guidance — deterministic, database-backed, no ML.

Compares candidate career interests with job role required skills,
using the candidate_skills table (Phase 4) for real matched/missing
skill computation via skill_proficiency_levels.rank_score.
"""
import uuid
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from app.core.database import get_db
from app.core.auth import get_current_user_optional

from app.models.identity import User, CandidateProfile, CandidateCareerInterest
from app.models.career import JobRole, JobRoleSkill
from app.models.phase4 import CandidateSkill
from app.models.skills import SkillProficiencyLevel
from app.models.demand import IndustryDemand
from pydantic import BaseModel, ConfigDict

router = APIRouter(prefix="/api/v1/career-guidance", tags=["Career Guidance"])


class CareerOption(BaseModel):
    job_role_id: uuid.UUID
    job_role_title: str
    source: str
    required_skill_ids: list[str]
    matched_skill_ids: list[str]
    missing_skill_ids: list[str]
    demand_signal_count: int
    relevant_course_count: int
    reasons: list[str]
    candidate_skills_status: str


class CareerRecommendationRequest(BaseModel):
    district_id: uuid.UUID | None = None
    industry_sector_id: uuid.UUID | None = None
    job_role_id: uuid.UUID


class DemandInfo(BaseModel):
    district_id: str | None = None
    district_name: str | None = None
    industry_sector_id: str | None = None
    industry_sector_name: str | None = None
    job_role_id: str | None = None
    job_role_title: str | None = None
    demand_score: float | None = None
    demand_signals_count: int = 0
    relevant_job_postings_count: int = 0
    demand_trend: str | None = None


class SkillInfo(BaseModel):
    id: str
    name: str | None = None
    description: str | None = None


class CourseInfo(BaseModel):
    id: str
    title: str
    description: str | None = None
    covers: list[str]
    why: str


class CareerRecommendationResponse(BaseModel):
    demand: DemandInfo | None = None
    required_skills: list[SkillInfo]
    candidate_skills: list[SkillInfo]
    skill_match_percentage: float
    matched_skill_count: int
    total_required_skills: int
    missing_skills: list[SkillInfo]
    recommended_courses: list[CourseInfo]
    job_readiness_percentage: float
    candidate_authenticated: bool
    message: str | None = None


@router.get(
    "",
    response_model=list[CareerOption],
    summary="Deterministic career guidance based on candidate interests and job role requirements",
)
def get_career_guidance(
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """
    Returns deterministic career guidance:
    - Reads candidate career interests (if set)
    - Compares against job role required skills using candidate_skills
    - NO ML, NO AI scoring
    """
    if not current_user:
        return []
    
    profile = db.scalar(
        select(CandidateProfile)
        .where(CandidateProfile.user_id == current_user.id)
        .options(selectinload(CandidateProfile.career_interests))
    )

    if not profile or not profile.career_interests:
        return []

    results = []
    for interest in profile.career_interests:
        role = db.scalar(
            select(JobRole)
            .where(JobRole.id == interest.target_job_role_id)
            .options(selectinload(JobRole.job_role_skills))
        )
        if not role:
            continue

        required_ids = [str(jrs.skill_id) for jrs in role.job_role_skills]

        # Real candidate skill matching via candidate_skills + rank_score
        candidate_skills = db.scalars(
            select(CandidateSkill).where(CandidateSkill.candidate_id == profile.id)
        ).all()
        candidate_by_skill = {cs.skill_id: cs for cs in candidate_skills}
        prof_ids = {jrs.proficiency_level_id for jrs in role.job_role_skills}
        prof_ids.update(cs.proficiency_level_id for cs in candidate_skills)
        prof_rows = db.scalars(
            select(SkillProficiencyLevel).where(SkillProficiencyLevel.id.in_(prof_ids))
        ).all() if prof_ids else []
        ranks = {row.id: row.rank_score for row in prof_rows}

        matched, missing = [], []
        for jrs in role.job_role_skills:
            cs = candidate_by_skill.get(jrs.skill_id)
            if cs is None:
                missing.append(str(jrs.skill_id))
            elif ranks.get(cs.proficiency_level_id, 0) >= ranks.get(jrs.proficiency_level_id, 0):
                matched.append(str(jrs.skill_id))
            else:
                missing.append(str(jrs.skill_id))
        demand_stmt = select(IndustryDemand.id).where(IndustryDemand.job_role_id == role.id)
        if profile.district_id:
            demand_stmt = demand_stmt.where(IndustryDemand.district_id == profile.district_id)
        demand_signal_count = len(db.scalars(demand_stmt).all())
        course_stmt = (
            select(Course.id)
            .join(CourseSkill)
            .where(CourseSkill.skill_id.in_([jrs.skill_id for jrs in role.job_role_skills]))
            .distinct()
        ) if required_ids else select(Course.id).where(False)
        relevant_course_count = len(db.scalars(course_stmt).all())
        reasons = ["Matches your selected interest"]
        if demand_signal_count:
            reasons.append("Persisted demand exists for this role in your district")
        else:
            reasons.append("No persisted district demand record is available for this role")
        if relevant_course_count:
            reasons.append("At least one available course covers a required skill")
        else:
            reasons.append("No available course is mapped to this role's required skills")

        results.append(CareerOption(
            job_role_id=role.id,
            job_role_title=role.title,
            source="candidate_career_interest",
            required_skill_ids=required_ids,
            matched_skill_ids=matched,
            missing_skill_ids=missing,
            candidate_skills_status="SUPPORTED_BY_CURRENT_DATA",
            demand_signal_count=demand_signal_count,
            relevant_course_count=relevant_course_count,
            reasons=reasons,
        ))

    return results


class JobRoleOut(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None = None
    is_active: bool
    industry_sector_id: uuid.UUID | None = None
    model_config = ConfigDict(from_attributes=True)


@router.get("/job-roles", response_model=list[JobRoleOut], summary="Job roles by sector")
def get_job_roles(
    industry_sector_id: uuid.UUID | None = Query(None, description="Filter by industry sector"),
    district_id: uuid.UUID | None = Query(None, description="Filter by district (via demand records)"),
    db: Session = Depends(get_db),
):
    """
    Get job roles that can be filtered by industry sector and/or district.
    
    When industry_sector_id is provided, returns job roles associated with that sector.
    When district_id is provided, returns job roles that have demand records in that district.
    When both are provided, returns job roles matching both criteria.
    When neither is provided, returns all active job roles.
    """
    # Start with base query for active job roles with industry_sector relationship
    stmt = select(JobRole).where(JobRole.is_active == True).options(selectinload(JobRole.industry_sector))
    
    # If industry_sector_id is provided, filter by it
    if industry_sector_id:
        # Filter job roles that are associated with this sector
        # This can be either directly via job_roles.industry_sector_id
        # or via industry_demand records
        stmt = stmt.where(
            (JobRole.industry_sector_id == industry_sector_id) |
            (JobRole.id.in_(
                select(IndustryDemand.job_role_id).where(
                    IndustryDemand.industry_sector_id == industry_sector_id
                )
            ))
        )
    
    # If district_id is provided, filter by demand records in that district
    if district_id:
        stmt = stmt.where(
            JobRole.id.in_(
                select(IndustryDemand.job_role_id).where(
                    (IndustryDemand.district_id == district_id) &
                    (IndustryDemand.job_role_id.isnot(None))
                )
            )
        )
    
    job_roles = db.scalars(stmt).all()
    return [JobRoleOut.model_validate(role) for role in job_roles]


@router.get("/recommendation", response_model=CareerRecommendationResponse, summary="Career recommendation for a specific job role")
def get_career_recommendation(
    district_id: uuid.UUID | None = Query(None, description="Filter by district"),
    industry_sector_id: uuid.UUID | None = Query(None, description="Filter by industry sector"),
    job_role_id: uuid.UUID = Query(..., description="Job role ID"),
    current_user: User | None = Depends(get_current_user_optional),  # Optional auth for public access
    db: Session = Depends(get_db),
):
    """
    Get career recommendation for a specific job role with optional district and sector filtering.
    This is used by the homepage "From Industry Demand to Career Recommendation" flow.
    """
    # Get the job role with its required skills
    role = db.scalar(
        select(JobRole)
        .where(JobRole.id == job_role_id)
        .options(selectinload(JobRole.job_role_skills))
    )
    
    if not role:
        raise HTTPException(status_code=404, detail="Job role not found")
    
    # Get candidate profile and skills (only if authenticated)
    profile = None
    candidate_authenticated = False
    candidate_skills_data = []
    
    if current_user:
        profile = db.scalar(
            select(CandidateProfile)
            .where(CandidateProfile.user_id == current_user.id)
        )
        candidate_authenticated = profile is not None
    
    if profile:
        candidate_skills = db.scalars(
            select(CandidateSkill).where(CandidateSkill.candidate_id == profile.id)
        ).all()
        candidate_by_skill = {cs.skill_id: cs for cs in candidate_skills}
        prof_ids = {jrs.proficiency_level_id for jrs in role.job_role_skills}
        prof_ids.update(cs.proficiency_level_id for cs in candidate_skills)
        prof_rows = db.scalars(
            select(SkillProficiencyLevel).where(SkillProficiencyLevel.id.in_(prof_ids))
        ).all() if prof_ids else []
        ranks = {row.id: row.rank_score for row in prof_rows}
        
        for jrs in role.job_role_skills:
            cs = candidate_by_skill.get(jrs.skill_id)
            if cs:
                candidate_skills_data.append(SkillInfo(
                    id=str(cs.skill_id),
                    name=cs.skill.name if cs.skill else None,
                    description=cs.skill.description if cs.skill else None
                ))
    
    # Get required skills
    required_skills = []
    for jrs in role.job_role_skills:
        required_skills.append(SkillInfo(
            id=str(jrs.skill_id),
            name=jrs.skill.name if jrs.skill else None,
            description=jrs.skill.description if jrs.skill else None
        ))
    
    # Calculate skill match
    matched_skills = []
    missing_skills = []
    
    if profile:
        candidate_skills = db.scalars(
            select(CandidateSkill).where(CandidateSkill.candidate_id == profile.id)
        ).all()
        candidate_by_skill = {cs.skill_id: cs for cs in candidate_skills}
        
        for jrs in role.job_role_skills:
            cs = candidate_by_skill.get(jrs.skill_id)
            if cs:
                matched_skills.append(SkillInfo(
                    id=str(jrs.skill_id),
                    name=jrs.skill.name if jrs.skill else None,
                    description=jrs.skill.description if jrs.skill else None
                ))
            else:
                missing_skills.append(SkillInfo(
                    id=str(jrs.skill_id),
                    name=jrs.skill.name if jrs.skill else None,
                    description=jrs.skill.description if jrs.skill else None
                ))
    else:
        # If not authenticated, all skills are missing
        for jrs in role.job_role_skills:
            missing_skills.append(SkillInfo(
                id=str(jrs.skill_id),
                name=jrs.skill.name if jrs.skill else None,
                description=jrs.skill.description if jrs.skill else None
            ))
    
    # Get demand information
    demand_stmt = select(IndustryDemand).where(IndustryDemand.job_role_id == role.id)
    if district_id:
        demand_stmt = demand_stmt.where(IndustryDemand.district_id == district_id)
    if industry_sector_id:
        demand_stmt = demand_stmt.where(IndustryDemand.industry_sector_id == industry_sector_id)
    
    demand_record = db.scalar(demand_stmt.order_by(IndustryDemand.aggregate_demand_score.desc()))
    
    demand_data = None
    if demand_record:
        demand_data = DemandInfo(
            district_id=str(demand_record.district_id) if demand_record.district_id else None,
            district_name=demand_record.district.name if demand_record.district else None,
            industry_sector_id=str(demand_record.industry_sector_id),
            industry_sector_name=demand_record.industry_sector.name if demand_record.industry_sector else None,
            job_role_id=str(demand_record.job_role_id) if demand_record.job_role_id else None,
            job_role_title=demand_record.job_role.title if demand_record.job_role else None,
            demand_score=demand_record.aggregate_demand_score,
            demand_signals_count=1,  # Simplified for now
            relevant_job_postings_count=0,  # Simplified for now
            demand_trend=None
        )
    
    # Get recommended courses
    course_stmt = (
        select(Course)
        .join(CourseSkill)
        .where(CourseSkill.skill_id.in_([jrs.skill_id for jrs in role.job_role_skills]))
        .distinct()
    )
    
    if district_id:
        course_stmt = course_stmt.where(
            (Course.district_id == district_id) | (Course.district_id.is_(None))
        )
    
    courses = db.scalars(course_stmt).all()
    
    # Build skill name lookup from required skills
    required_skill_ids = {jrs.skill_id for jrs in role.job_role_skills}
    skill_names = {jrs.skill_id: jrs.skill.name if jrs.skill else str(jrs.skill_id) for jrs in role.job_role_skills}
    
    recommended_courses = []
    for course in courses:
        # Get matching skill IDs for this course
        course_skill_ids = [cs.skill_id for cs in course.course_skills if cs.skill_id in required_skill_ids]
        # Convert to skill names
        covered_skill_names = [skill_names.get(sid, str(sid)) for sid in course_skill_ids]
        
        recommended_courses.append(CourseInfo(
            id=str(course.id),
            title=course.title,
            description=course.description,
            covers=covered_skill_names,
            why="Covers required skills for this job role"
        ))
    
    # Calculate skill match percentage
    total_required = len(role.job_role_skills)
    matched_count = len(matched_skills)
    skill_match_percentage = (matched_count / total_required * 100) if total_required > 0 else 0
    
    return CareerRecommendationResponse(
        demand=demand_data,
        required_skills=required_skills,
        candidate_skills=candidate_skills_data,
        skill_match_percentage=skill_match_percentage,
        matched_skill_count=matched_count,
        total_required_skills=total_required,
        missing_skills=missing_skills,
        recommended_courses=recommended_courses,
        job_readiness_percentage=skill_match_percentage,  # Simplified
        candidate_authenticated=candidate_authenticated,
        message="Career recommendation based on selected job role"
    )
