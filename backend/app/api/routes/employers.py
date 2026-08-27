
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import require_roles
from app.models.identity import User
from app.schemas.employers import EmployerResponse
from app.schemas.jobs import JobResponse, JobCreate, JobPostingSkillCreate, JobPostingSkillResponse
from app.schemas.common import MessageResponse
from app.services.employer_service import EmployerService

router = APIRouter(prefix="/api/v1/employers", tags=["Employers"])

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
