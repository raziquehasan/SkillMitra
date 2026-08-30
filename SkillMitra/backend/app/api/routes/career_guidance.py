from app.models.demand import IndustryDemand
from app.models.career import Course, CourseSkill
from app.models.market import JobPosting
"""
Career Guidance — deterministic, database-backed, no ML.

Compares candidate career interests with job role required skills,
using the candidate_skills table (Phase 4) for real matched/missing
skill computation via skill_proficiency_levels.rank_score.
"""
import uuid
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select, func
from sqlalchemy.orm import Session, selectinload
from app.core.database import get_db
from app.core.auth import get_current_active_user, get_current_user_optional
from app.models.identity import User, CandidateProfile, CandidateCareerInterest
from app.models.career import JobRole, JobRoleSkill, CourseSkill
from app.models.phase4 import CandidateSkill
from app.models.skills import SkillProficiencyLevel, Skill
from app.models.demand import IndustryDemand, IndustrySector
from pydantic import BaseModel

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


@router.get(
    "",
    response_model=list[CareerOption],
    summary="Deterministic career guidance based on candidate interests and job role requirements",
)
def get_career_guidance(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Returns deterministic career guidance:
    - Reads candidate career interests (if set)
    - Compares against job role required skills using candidate_skills
    - NO ML, NO AI scoring
    """
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


# =========================================================
# Public recommendation endpoint for homepage
# =========================================================

class SkillOut(BaseModel):
    id: str
    name: str
    description: str | None = None


class DemandInfoOut(BaseModel):
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


class RecommendationResponse(BaseModel):
    demand: DemandInfoOut | None = None
    required_skills: list[SkillOut] = []
    candidate_skills: list[SkillOut] = []
    skill_match_percentage: float = 0.0
    matched_skill_count: int = 0
    total_required_skills: int = 0
    missing_skills: list[SkillOut] = []
    recommended_courses: list[dict] = []
    job_readiness_percentage: float = 0.0
    candidate_authenticated: bool = False
    message: str | None = None


@router.get(
    "/recommendation",
    response_model=RecommendationResponse,
    summary="Demand-to-career recommendation for homepage",
)
def get_career_recommendation(
    district_id: uuid.UUID | None = Query(None),
    industry_sector_id: uuid.UUID | None = Query(None),
    job_role_id: uuid.UUID | None = Query(None),
    current_user: User | None = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    response = RecommendationResponse(
        demand=None,
        required_skills=[],
        candidate_skills=[],
        skill_match_percentage=0.0,
        matched_skill_count=0,
        total_required_skills=0,
        missing_skills=[],
        recommended_courses=[],
        job_readiness_percentage=0.0,
        candidate_authenticated=False,
        message=None,
    )

    if not job_role_id:
        response.message = "Select a job role to see recommendations."
        return response

    # Load job role with required skills
    role = db.scalar(
        select(JobRole)
        .where(JobRole.id == job_role_id)
        .options(selectinload(JobRole.job_role_skills).selectinload(JobRoleSkill.skill))
    )
    if not role:
        response.message = "Job role not found."
        return response

    required_skills = []
    for jrs in role.job_role_skills:
        if jrs.skill:
            required_skills.append(SkillOut(
                id=str(jrs.skill.id),
                name=jrs.skill.name,
                description=jrs.skill.description,
            ))
    response.total_required_skills = len(required_skills)
    response.required_skills = required_skills

    # Demand info
    demand_query = select(IndustryDemand).where(IndustryDemand.job_role_id == job_role_id)
    if district_id:
        demand_query = demand_query.where(IndustryDemand.district_id == district_id)
    if industry_sector_id:
        demand_query = demand_query.where(IndustryDemand.industry_sector_id == industry_sector_id)
    demand_rows = db.scalars(demand_query.order_by(IndustryDemand.aggregate_demand_score.desc())).all()

    district_name = None
    sector_name = None
    if district_id:
        from app.models.geography import District
        district = db.scalar(select(District).where(District.id == district_id))
        if district:
            district_name = district.name
    if industry_sector_id:
        sector = db.scalar(select(IndustrySector).where(IndustrySector.id == industry_sector_id))
        if sector:
            sector_name = sector.name

    demand_score = None
    demand_trend = None
    if demand_rows:
        demand_score = demand_rows[0].aggregate_demand_score
        if demand_score >= 7.5:
            demand_trend = "High"
        elif demand_score >= 5.0:
            demand_trend = "Growing"
        elif demand_score >= 2.5:
            demand_trend = "Moderate"
        else:
            demand_trend = "Low"

    # Count relevant job postings
    job_query = select(func.count(JobPosting.id)).where(JobPosting.job_role_id == job_role_id)
    if district_id:
        job_query = job_query.where(JobPosting.district_id == district_id)
    relevant_jobs_count = db.scalar(job_query) or 0

    response.demand = DemandInfoOut(
        district_id=str(district_id) if district_id else None,
        district_name=district_name,
        industry_sector_id=str(industry_sector_id) if industry_sector_id else None,
        industry_sector_name=sector_name,
        job_role_id=str(job_role_id),
        job_role_title=role.title,
        demand_score=demand_score,
        demand_signals_count=len(demand_rows),
        relevant_job_postings_count=relevant_jobs_count,
        demand_trend=demand_trend,
    )

    # Candidate skills (if authenticated)
    candidate_skills = []
    matched_skill_ids = set()
    if current_user:
        profile = db.scalar(
            select(CandidateProfile)
            .where(CandidateProfile.user_id == current_user.id)
        )
        if profile:
            candidate_skill_rows = db.scalars(
                select(CandidateSkill).where(CandidateSkill.candidate_id == profile.id)
            ).all()
            candidate_by_skill = {cs.skill_id: cs for cs in candidate_skill_rows}
            prof_ids = {jrs.proficiency_level_id for jrs in role.job_role_skills}
            prof_ids.update(cs.proficiency_level_id for cs in candidate_skill_rows)
            prof_rows = db.scalars(
                select(SkillProficiencyLevel).where(SkillProficiencyLevel.id.in_(prof_ids))
            ).all() if prof_ids else []
            ranks = {row.id: row.rank_score for row in prof_rows}

            for cs in candidate_skill_rows:
                if cs.skill:
                    candidate_skills.append(SkillOut(
                        id=str(cs.skill.id),
                        name=cs.skill.name,
                        description=cs.skill.description,
                    ))

            matched = 0
            for jrs in role.job_role_skills:
                cs = candidate_by_skill.get(jrs.skill_id)
                if cs is not None:
                    if ranks.get(cs.proficiency_level_id, 0) >= ranks.get(jrs.proficiency_level_id, 0):
                        matched += 1
                        matched_skill_ids.add(str(jrs.skill_id))

            response.candidate_authenticated = True
            response.matched_skill_count = matched
            if response.total_required_skills > 0:
                response.skill_match_percentage = round((matched / response.total_required_skills) * 100, 1)
            response.job_readiness_percentage = response.skill_match_percentage

    # Missing skills
    missing = []
    for jrs in role.job_role_skills:
        if str(jrs.skill_id) not in matched_skill_ids:
            if jrs.skill:
                missing.append(SkillOut(
                    id=str(jrs.skill.id),
                    name=jrs.skill.name,
                    description=jrs.skill.description,
                ))
    response.missing_skills = missing

    # Recommended courses based on missing skills
    if missing:
        missing_ids = [s.id for s in missing]
        course_stmt = (
            select(Course)
            .join(CourseSkill)
            .where(CourseSkill.skill_id.in_(missing_ids))
            .distinct()
            .limit(5)
        )
        courses = db.scalars(course_stmt).all()
        for course in courses:
            covered = [
                cs.skill.name for cs in course.course_skills
                if cs.skill_id in missing_ids
            ]
            response.recommended_courses.append({
                "id": str(course.id),
                "title": course.title,
                "description": course.description,
                "covers": covered,
                "why": f"Addresses your missing skills: {', '.join(covered)}",
            })

    if not response.candidate_authenticated:
        response.message = "Login to compare your skills with this role."

    return response
