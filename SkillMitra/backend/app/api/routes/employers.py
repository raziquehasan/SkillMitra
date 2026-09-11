
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.core.database import get_db
from app.core.auth import require_roles
from app.api.deps import get_pagination
from app.models.identity import User, Employer
from app.schemas.employers import EmployerResponse
from app.schemas.jobs import JobResponse, JobCreate, JobPostingSkillCreate, JobPostingSkillResponse
from app.schemas.common import MessageResponse
from app.services.employer_service import EmployerService
from app.services.training_alignment_service import EmployerValidationService
from pydantic import BaseModel, ConfigDict

router = APIRouter(prefix="/api/v1/employers", tags=["Employers"])


class CurriculumValidationIn(BaseModel):
    course_id: uuid.UUID
    curriculum_version_id: uuid.UUID | None = None
    status: str
    feedback: str | None = None


class CurriculumValidationOut(BaseModel):
    id: uuid.UUID
    employer_id: uuid.UUID
    course_id: uuid.UUID
    curriculum_version_id: uuid.UUID | None = None
    status: str
    feedback: str | None = None
    created_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)


@router.post("/me/curriculum-validations", response_model=CurriculumValidationOut, status_code=201)
def submit_curriculum_validation(
    data: CurriculumValidationIn,
    current_user: User = Depends(require_roles("employer")),
    db: Session = Depends(get_db),
):
    from app.models.phase6 import EmployerCurriculumValidation
    validation = EmployerCurriculumValidation(
        employer_id=current_user.id,
        course_id=data.course_id,
        curriculum_version_id=data.curriculum_version_id,
        status=data.status,
        feedback=data.feedback,
    )
    db.add(validation)
    db.commit()
    db.refresh(validation)
    return validation


@router.get("/me/curriculum-validations", response_model=list[CurriculumValidationOut])
def list_my_curriculum_validations(
    pagination: dict = Depends(get_pagination),
    current_user: User = Depends(require_roles("employer")),
    db: Session = Depends(get_db),
):
    from app.models.phase6 import EmployerCurriculumValidation
    stmt = select(EmployerCurriculumValidation).where(EmployerCurriculumValidation.employer_id == current_user.id)
    return db.scalars(stmt.offset(pagination["skip"]).limit(pagination["limit"])).all()

@router.get("/me", response_model=EmployerResponse)
def get_my_employer_profile(
    current_user: User = Depends(require_roles("employer")),
    db: Session = Depends(get_db)
):
    return EmployerService(db).get_employer(current_user.id)

@router.post("/me/jobs", response_model=JobResponse, status_code=201)
def create_job(
    data: JobCreate,
    current_user: User = Depends(require_roles("employer")),
    db: Session = Depends(get_db)
):
    return EmployerService(db).create_job(current_user.id, data)

@router.post("/me/jobs/{job_id}/skills", response_model=JobPostingSkillResponse, status_code=201)
def add_skill_to_job(
    job_id: uuid.UUID,
    data: JobPostingSkillCreate,
    current_user: User = Depends(require_roles("employer")),
    db: Session = Depends(get_db)
):
    return EmployerService(db).add_job_skill(current_user.id, job_id, data)

@router.delete("/me/jobs/{job_id}/skills/{skill_id}", response_model=MessageResponse)
def remove_skill_from_job(
    job_id: uuid.UUID,
    skill_id: uuid.UUID,
    current_user: User = Depends(require_roles("employer")),
    db: Session = Depends(get_db)
):
    EmployerService(db).remove_job_skill(current_user.id, job_id, skill_id)
    return {"message": "Skill removed successfully"}


@router.get("/me/candidates", response_model=list[dict])
def get_my_candidates(
    current_user: User = Depends(require_roles("employer")),
    db: Session = Depends(get_db)
):
    """
    Returns candidates matched to the employer's job postings based on skill requirements.
    This endpoint performs skill-based matching between employer job requirements and candidate skills.
    """
    from app.models.identity import CandidateProfile
    from app.models.phase4 import CandidateSkill
    from app.models.market import JobPosting, JobPostingSkill
    from app.models.career import JobRoleSkill
    from sqlalchemy.orm import selectinload

    # Get employer profile
    employer = db.scalar(
        select(Employer).where(Employer.user_id == current_user.id)
    )

    if not employer:
        return []

    # Get employer's job postings with their skill requirements
    job_postings = db.scalars(
        select(JobPosting)
        .where(JobPosting.employer_id == employer.id)
        .options(selectinload(JobPosting.job_posting_skills))
    ).all()

    if not job_postings:
        return []

    # Collect all required skills from employer's job postings
    required_skill_ids = set()
    for job in job_postings:
        for jps in job.job_posting_skills:
            required_skill_ids.add(jps.skill_id)

    if not required_skill_ids:
        return []

    # Get candidates with skills that match the requirements
    candidates = db.scalars(
        select(CandidateProfile)
        .options(selectinload(CandidateProfile.user))
    ).all()

    matched_candidates = []
    for candidate in candidates:
        # Get candidate's skills
        candidate_skills = db.scalars(
            select(CandidateSkill).where(CandidateSkill.candidate_id == candidate.id)
        ).all()

        candidate_skill_ids = {cs.skill_id for cs in candidate_skills}

        # Calculate match score
        matched_skills = required_skill_ids & candidate_skill_ids
        match_score = len(matched_skills) / len(required_skill_ids) if required_skill_ids else 0

        # Only include candidates with some skill match
        if match_score > 0:
            # Get additional candidate info
            user = candidate.user
            matched_candidates.append({
                "id": str(candidate.id),
                "name": user.full_name if user else "Unknown",
                "email": user.email if user else None,
                "education_level": candidate.education_level,
                "current_status": candidate.current_status,
                "district_id": str(candidate.district_id) if candidate.district_id else None,
                "match_score": round(match_score * 100, 1),
                "matched_skills_count": len(matched_skills),
                "total_required_skills": len(required_skill_ids),
                "skills": [str(skill_id) for skill_id in matched_skills],
            })

    # Sort by match score (descending)
    matched_candidates.sort(key=lambda x: x["match_score"], reverse=True)

    return matched_candidates


@router.get("/me/applications", response_model=list[dict])
def get_my_applications(
    current_user: User = Depends(require_roles("employer")),
    db: Session = Depends(get_db)
):
    """
    Returns applications for the employer's job postings.
    Security: Only shows applications for jobs owned by this employer.
    """
    from app.models.market import Application, JobPosting
    from app.models.identity import CandidateProfile
    from sqlalchemy.orm import selectinload

    # Get employer profile
    employer = db.scalar(
        select(Employer).where(Employer.user_id == current_user.id)
    )

    if not employer:
        return []

    # Get employer's job posting IDs
    job_posting_ids = db.scalars(
        select(JobPosting.id).where(JobPosting.employer_id == employer.id)
    ).all()

    if not job_posting_ids:
        return []

    # Get applications for employer's job postings
    applications = db.scalars(
        select(Application)
        .where(Application.job_posting_id.in_(job_posting_ids))
        .options(
            selectinload(Application.job_posting)
            .selectinload(JobPosting.employer)
            .selectinload(JobPosting.district),
            selectinload(Application.candidate)
            .selectinload(CandidateProfile.user)
        )
        .order_by(Application.applied_at.desc())
    ).all()

    result = []
    for app in applications:
        job_posting = app.job_posting
        candidate = app.candidate
        user = candidate.user if candidate else None
        
        result.append({
            "id": str(app.id),
            "candidate_id": str(app.candidate_id),
            "candidate_name": user.full_name if user else "Unknown",
            "candidate_email": user.email if user else None,
            "job_posting_id": str(app.job_posting_id),
            "job_title": job_posting.title if job_posting else None,
            "company_name": job_posting.employer.company_name if job_posting and job_posting.employer else None,
            "district_name": job_posting.district.name if job_posting and job_posting.district else None,
            "status": app.status,
            "applied_at": app.applied_at.isoformat() if app.applied_at else None,
        })

    return result
