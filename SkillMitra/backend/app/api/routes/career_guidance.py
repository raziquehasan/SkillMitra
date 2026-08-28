from app.models.demand import IndustryDemand
from app.models.career import Course, CourseSkill
"""
Career Guidance — deterministic, database-backed, no ML.

Compares candidate career interests with job role required skills,
using the candidate_skills table (Phase 4) for real matched/missing
skill computation via skill_proficiency_levels.rank_score.
"""
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from app.core.database import get_db
from app.core.auth import get_current_active_user
from app.models.identity import User, CandidateProfile, CandidateCareerInterest
from app.models.career import JobRole, JobRoleSkill
from app.models.phase4 import CandidateSkill
from app.models.skills import SkillProficiencyLevel
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
