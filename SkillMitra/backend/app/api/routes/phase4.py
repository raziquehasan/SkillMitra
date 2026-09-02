"""Phase 4 training supply and curriculum APIs."""
import uuid
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.api.deps import get_pagination
from app.core.auth import get_current_active_user, require_roles
from app.core.database import get_db
from app.models.career import Course
from app.models.identity import User
from app.models.phase4 import (
    CourseEquipmentRequirement, CourseOffering, Curriculum, CurriculumSkill,
    CurriculumVersion, Equipment, Trainer, TrainerSkill, TrainingProvider,
)
from app.models.phase9 import CurriculumProposal
from app.models.skills import SkillProficiencyLevel
from app.services.training_alignment_service import CurriculumProposalService, AuditService
from pydantic import BaseModel, ConfigDict

router = APIRouter(prefix="/api/v1", tags=["Phase 4 Training Supply"])


class CurriculumProposalIn(BaseModel):
    curriculum_version_id: uuid.UUID
    course_id: uuid.UUID
    proposed_changes: dict | None = None
    reason: str | None = None


class CurriculumProposalOut(BaseModel):
    proposal_id: str
    curriculum_version_id: str
    course_id: str
    status: str
    reason: str | None = None
    review_notes: str | None = None
    employer_validated: bool
    implemented_at: str | None = None
    model_config = ConfigDict(from_attributes=True)


class CurriculumProposalReviewIn(BaseModel):
    status: str
    review_notes: str | None = None


class ProviderCreate(BaseModel):
    district_id: uuid.UUID
    name: str
    registration_number: str | None = None


class ProviderUpdate(BaseModel):
    name: str | None = None
    contact_person: str | None = None
    phone: str | None = None
    source_email: str | None = None
    source_address: str | None = None
    source_city: str | None = None


class ProviderOut(ProviderCreate):
    id: uuid.UUID
    user_id: uuid.UUID
    contact_person: str | None = None
    phone: str | None = None
    provider_type: str | None = None
    status: str
    verification_status: str
    submitted_at: datetime | None = None
    source_scheme: str | None = None
    source_city: str | None = None
    source_address: str | None = None
    source_email: str | None = None
    source_sector: str | None = None
    model_config = ConfigDict(from_attributes=True)


class OfferingCreate(BaseModel):
    course_id: uuid.UUID
    district_id: uuid.UUID
    sanctioned_seats: int = 0
    active_seats: int = 0
    utilized_seats: int = 0


class OfferingOut(OfferingCreate):
    id: uuid.UUID
    provider_id: uuid.UUID
    status: str
    available_seats: int
    model_config = ConfigDict(from_attributes=True)


class TrainerCreate(BaseModel):
    name: str


class TrainerOut(TrainerCreate):
    id: uuid.UUID
    provider_id: uuid.UUID
    status: str
    model_config = ConfigDict(from_attributes=True)


class EquipmentCreate(BaseModel):
    district_id: uuid.UUID
    name: str
    quantity: int = 0
    available_quantity: int = 0


class EquipmentOut(EquipmentCreate):
    id: uuid.UUID
    provider_id: uuid.UUID
    status: str
    model_config = ConfigDict(from_attributes=True)


class CurriculumOut(BaseModel):
    id: uuid.UUID
    course_id: uuid.UUID
    title: str
    description: str | None
    model_config = ConfigDict(from_attributes=True)


class CurriculumVersionOut(BaseModel):
    id: uuid.UUID
    curriculum_id: uuid.UUID
    version_number: int
    effective_from: date | None
    effective_to: date | None
    status: str
    model_config = ConfigDict(from_attributes=True)


def _provider(db: Session, user_id: uuid.UUID) -> TrainingProvider:
    provider = db.scalar(select(TrainingProvider).where(TrainingProvider.user_id == user_id))
    if not provider:
        raise HTTPException(status_code=404, detail="Training provider profile not found")
    return provider


@router.get("/training-providers/me", response_model=ProviderOut)
def get_provider_me(current_user: User = Depends(require_roles("training_provider")), db: Session = Depends(get_db)):
    return _provider(db, current_user.id)


@router.patch("/training-providers/me", response_model=ProviderOut)
def update_provider_me(
    data: ProviderUpdate,
    current_user: User = Depends(require_roles("training_provider")),
    db: Session = Depends(get_db),
):
    provider = _provider(db, current_user.id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(provider, field, value)
    db.commit()
    db.refresh(provider)
    return provider


@router.post("/training-providers/me", response_model=ProviderOut, status_code=201)
def create_provider_me(data: ProviderCreate, current_user: User = Depends(require_roles("training_provider")), db: Session = Depends(get_db)):
    existing = db.scalar(select(TrainingProvider).where(TrainingProvider.user_id == current_user.id))
    if existing:
        raise HTTPException(status_code=409, detail="Training provider profile already exists")
    provider = TrainingProvider(user_id=current_user.id, **data.model_dump())
    db.add(provider)
    db.commit()
    db.refresh(provider)
    return provider


@router.get("/training-providers/me/offerings", response_model=list[OfferingOut])
def list_my_offerings(pagination: dict = Depends(get_pagination), current_user: User = Depends(require_roles("training_provider")), db: Session = Depends(get_db)):
    provider = _provider(db, current_user.id)
    rows = db.scalars(select(CourseOffering).where(CourseOffering.provider_id == provider.id).offset(pagination["skip"]).limit(pagination["limit"])).all()
    return [OfferingOut.model_validate({**row.__dict__, "available_seats": row.active_seats - row.utilized_seats}) for row in rows]


@router.post("/training-providers/me/offerings", response_model=OfferingOut, status_code=201)
def create_my_offering(data: OfferingCreate, current_user: User = Depends(require_roles("training_provider")), db: Session = Depends(get_db)):
    provider = _provider(db, current_user.id)
    offering = CourseOffering(provider_id=provider.id, **data.model_dump())
    db.add(offering)
    db.commit()
    db.refresh(offering)
    return OfferingOut.model_validate({**offering.__dict__, "available_seats": offering.active_seats - offering.utilized_seats})


@router.get("/training-providers/me/trainers", response_model=list[TrainerOut])
def list_my_trainers(pagination: dict = Depends(get_pagination), current_user: User = Depends(require_roles("training_provider")), db: Session = Depends(get_db)):
    provider = _provider(db, current_user.id)
    return db.scalars(select(Trainer).where(Trainer.provider_id == provider.id).offset(pagination["skip"]).limit(pagination["limit"])).all()


@router.post("/training-providers/me/trainers", response_model=TrainerOut, status_code=201)
def create_my_trainer(data: TrainerCreate, current_user: User = Depends(require_roles("training_provider")), db: Session = Depends(get_db)):
    provider = _provider(db, current_user.id)
    trainer = Trainer(provider_id=provider.id, **data.model_dump())
    db.add(trainer)
    db.commit()
    db.refresh(trainer)
    return trainer


@router.get("/training-providers/me/equipment", response_model=list[EquipmentOut])
def list_my_equipment(pagination: dict = Depends(get_pagination), current_user: User = Depends(require_roles("training_provider")), db: Session = Depends(get_db)):
    provider = _provider(db, current_user.id)
    return db.scalars(select(Equipment).where(Equipment.provider_id == provider.id).offset(pagination["skip"]).limit(pagination["limit"])).all()


@router.post("/training-providers/me/equipment", response_model=EquipmentOut, status_code=201)
def create_my_equipment(data: EquipmentCreate, current_user: User = Depends(require_roles("training_provider")), db: Session = Depends(get_db)):
    provider = _provider(db, current_user.id)
    equipment = Equipment(provider_id=provider.id, **data.model_dump())
    db.add(equipment)
    db.commit()
    db.refresh(equipment)
    return equipment


@router.get("/courses/{course_id}/curricula", response_model=list[CurriculumOut])
def list_course_curricula(course_id: uuid.UUID, db: Session = Depends(get_db)):
    if not db.scalar(select(Course.id).where(Course.id == course_id)):
        raise HTTPException(status_code=404, detail="Course not found")
    return db.scalars(select(Curriculum).where(Curriculum.course_id == course_id)).all()


@router.get("/curricula/{curriculum_id}/versions", response_model=list[CurriculumVersionOut])
def list_curriculum_versions(curriculum_id: uuid.UUID, db: Session = Depends(get_db)):
    return db.scalars(select(CurriculumVersion).where(CurriculumVersion.curriculum_id == curriculum_id)).all()


@router.get("/government/training-supply", response_model=list[OfferingOut])
def government_training_supply(
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
    return [OfferingOut.model_validate({**row.__dict__, "available_seats": row.active_seats - row.utilized_seats}) for row in rows]


@router.post("/curriculum/proposals", response_model=CurriculumProposalOut, status_code=201)
def create_curriculum_proposal(
    data: CurriculumProposalIn,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    svc = CurriculumProposalService(db)
    result = svc.create_proposal(
        curriculum_version_id=str(data.curriculum_version_id),
        course_id=str(data.course_id),
        proposed_by_user_id=str(current_user.id),
        proposed_changes=data.proposed_changes,
        reason=data.reason,
    )
    proposal = db.get(CurriculumProposal, result["proposal_id"])
    return CurriculumProposalOut(
        proposal_id=str(proposal.id),
        curriculum_version_id=str(proposal.curriculum_version_id),
        course_id=str(proposal.course_id),
        status=proposal.status,
        reason=proposal.reason,
        review_notes=proposal.review_notes,
        employer_validated=proposal.employer_validated,
        implemented_at=proposal.implemented_at.isoformat() if proposal.implemented_at else None,
    )


@router.get("/curriculum/proposals/{proposal_id}", response_model=CurriculumProposalOut)
def get_curriculum_proposal(
    proposal_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    svc = CurriculumProposalService(db)
    result = svc.get_proposal(str(proposal_id))
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    proposal = db.get(CurriculumProposal, proposal_id)
    return CurriculumProposalOut(
        proposal_id=str(proposal.id),
        curriculum_version_id=str(proposal.curriculum_version_id),
        course_id=str(proposal.course_id),
        status=proposal.status,
        reason=proposal.reason,
        review_notes=proposal.review_notes,
        employer_validated=proposal.employer_validated,
        implemented_at=proposal.implemented_at.isoformat() if proposal.implemented_at else None,
    )


@router.post("/curriculum/proposals/{proposal_id}/review")
def review_curriculum_proposal(
    proposal_id: uuid.UUID,
    data: CurriculumProposalReviewIn,
    current_user: User = Depends(require_roles("government_admin")),
    db: Session = Depends(get_db),
):
    svc = CurriculumProposalService(db)
    result = svc.update_proposal_status(
        proposal_id=str(proposal_id),
        new_status=data.status,
        reviewed_by_user_id=str(current_user.id),
        review_notes=data.review_notes,
    )
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result
