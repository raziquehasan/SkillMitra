
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import require_roles
from app.models.identity import User
from app.schemas.candidates import (
    CandidateProfileResponse, CandidateProfileUpdate,
    CandidateEducationResponse, CandidateEducationCreate,
    CandidateInterestResponse, CandidateInterestCreate,
    SkillGapResponse, CandidateSkillResponse, CandidateSkillCreate, CandidateSkillUpdate,
)
from app.schemas.common import MessageResponse
from app.services.candidate_service import CandidateService

router = APIRouter(prefix="/api/v1/candidates", tags=["Candidates"])


@router.get("/me", response_model=CandidateProfileResponse,
            summary="Get my candidate profile")
def get_my_profile(
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    return CandidateService(db).get_or_create_profile(current_user.id)


@router.patch("/me", response_model=CandidateProfileResponse,
              summary="Update my candidate profile")
def update_my_profile(
    data: CandidateProfileUpdate,
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    return CandidateService(db).update_profile(current_user.id, data)


@router.get("/me/education", response_model=list[CandidateEducationResponse],
            summary="List my education records")
def get_my_education(
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    profile = CandidateService(db).get_or_create_profile(current_user.id)
    return profile.education_history


@router.post("/me/education", response_model=CandidateEducationResponse,
             status_code=201, summary="Add education record")
def add_my_education(
    data: CandidateEducationCreate,
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    return CandidateService(db).add_education(current_user.id, data)


@router.delete("/me/education/{education_id}", response_model=MessageResponse,
               summary="Delete education record")
def delete_my_education(
    education_id: uuid.UUID,
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    CandidateService(db).delete_education(current_user.id, education_id)
    return {"message": "Deleted successfully"}


@router.get("/me/interests", response_model=list[CandidateInterestResponse],
            summary="Get my career interests")
def get_my_interests(
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    profile = CandidateService(db).get_or_create_profile(current_user.id)
    return profile.career_interests


@router.post("/me/interests", response_model=CandidateInterestResponse,
             status_code=201, summary="Add career interest")
def add_my_interest(
    data: CandidateInterestCreate,
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    return CandidateService(db).add_interest(current_user.id, data)


@router.delete("/me/interests/{interest_id}", response_model=MessageResponse,
               summary="Remove career interest")
def delete_my_interest(
    interest_id: uuid.UUID,
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    CandidateService(db).delete_interest(current_user.id, interest_id)
    return {"message": "Deleted successfully"}


@router.get("/me/skill-gaps", response_model=list[SkillGapResponse],
            summary="Skill gaps vs job role requirements")
def get_my_skill_gaps(
    job_role_id: uuid.UUID | None = None,
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    return CandidateService(db).get_skill_gaps(current_user.id, job_role_id)


@router.get("/me/skills", response_model=list[CandidateSkillResponse],
            summary="List my skills")
def get_my_skills(
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    return CandidateService(db).list_skills(current_user.id)


@router.post("/me/skills", response_model=CandidateSkillResponse, status_code=201,
             summary="Add a skill to my profile")
def add_my_skill(
    data: CandidateSkillCreate,
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    return CandidateService(db).add_skill(current_user.id, data)


@router.patch("/me/skills/{skill_id}", response_model=CandidateSkillResponse,
              summary="Update my skill")
def update_my_skill(
    skill_id: uuid.UUID,
    data: CandidateSkillUpdate,
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    return CandidateService(db).update_skill(current_user.id, skill_id, data)


@router.delete("/me/skills/{skill_id}", response_model=MessageResponse,
               summary="Remove my skill")
def delete_my_skill(
    skill_id: uuid.UUID,
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    CandidateService(db).delete_skill(current_user.id, skill_id)
    return {"message": "Deleted successfully"}
