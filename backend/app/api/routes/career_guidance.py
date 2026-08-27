"""
Career Guidance — deterministic, database-backed, no ML.

Compares candidate career interests with job role required skills.
Candidate skills (candidate_skills table) is a FUTURE DATABASE PHASE dependency.
Currently shows full missing list with no matched skills until that phase lands.
"""
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from app.core.database import get_db
from app.core.auth import get_current_active_user
from app.models.identity import User, CandidateProfile, CandidateCareerInterest
from app.models.career import JobRole, JobRoleSkill
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/career-guidance", tags=["Career Guidance"])


class CareerOption(BaseModel):
    job_role_id: uuid.UUID
    job_role_title: str
    source: str
    required_skill_ids: list[str]
    matched_skill_ids: list[str]
    missing_skill_ids: list[str]
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
    - Compares against job role required skills
    - NO ML, NO AI scoring

    NOTE: Candidate skill matching requires the candidate_skills table
    (DEPENDENCY - FUTURE DATABASE PHASE). Until then, all required skills
    are listed as missing and matched skills is empty.
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

        # candidate_skills not yet in schema — documented as future dependency
        results.append(CareerOption(
            job_role_id=role.id,
            job_role_title=role.title,
            source="candidate_career_interest",
            required_skill_ids=required_ids,
            matched_skill_ids=[],
            missing_skill_ids=required_ids,
            candidate_skills_status=(
                "NOT_YET_AVAILABLE — candidate_skills table requires Phase 4 assessment schema"
            ),
        ))

    return results
