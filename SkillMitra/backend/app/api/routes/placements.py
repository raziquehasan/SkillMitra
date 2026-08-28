
"""Placement endpoints — role-scoped."""
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import require_roles
from app.models.identity import User, CandidateProfile, Employer
from app.models.market import Placement
from app.api.deps import get_pagination
from pydantic import BaseModel, ConfigDict

router = APIRouter(prefix="/api/v1/placements", tags=["Placements"])

class PlacementOut(BaseModel):
    id: uuid.UUID
    candidate_id: uuid.UUID
    job_posting_id: uuid.UUID
    model_config = ConfigDict(from_attributes=True)

@router.get("/me", response_model=list[PlacementOut])
def my_placements(
    pagination: dict = Depends(get_pagination),
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    profile = db.scalar(select(CandidateProfile).where(CandidateProfile.user_id == current_user.id))
    if not profile:
        return []
    stmt = select(Placement).where(Placement.candidate_id == profile.id)
    return db.scalars(stmt.offset(pagination["skip"]).limit(pagination["limit"])).all()
