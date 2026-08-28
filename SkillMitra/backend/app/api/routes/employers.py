
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import require_roles
from app.api.deps import get_pagination
from app.models.identity import User
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
