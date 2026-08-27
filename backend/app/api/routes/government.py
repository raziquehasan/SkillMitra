"""Government analytics endpoints - RBAC: government_admin."""
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import require_roles
from app.models.identity import User
from app.models.market import Placement
from app.models.demand import IndustryDemand
from app.api.deps import get_pagination
from pydantic import BaseModel, ConfigDict

router = APIRouter(prefix="/api/v1/government", tags=["Government Analytics"])

class PlacementOut(BaseModel):
    id: uuid.UUID
    candidate_id: uuid.UUID
    job_posting_id: uuid.UUID | None = None
    employer_id: uuid.UUID | None = None
    job_role_id: uuid.UUID | None = None
    district_id: uuid.UUID | None = None
    outcome_status: str | None = None
    model_config = ConfigDict(from_attributes=True)

class IndustryDemandOut(BaseModel):
    id: uuid.UUID
    industry_sector_id: uuid.UUID
    job_role_id: uuid.UUID | None = None
    district_id: uuid.UUID | None = None
    aggregate_demand_score: float | None = None
    model_config = ConfigDict(from_attributes=True)

@router.get("/placements", response_model=list[PlacementOut])
def gov_placements(
    district_id: uuid.UUID | None = None,
    pagination: dict = Depends(get_pagination),
    current_user: User = Depends(require_roles("government_admin")),
    db: Session = Depends(get_db),
):
    stmt = select(Placement)
    if district_id:
        stmt = stmt.where(Placement.district_id == district_id)
    return db.scalars(stmt.offset(pagination["skip"]).limit(pagination["limit"])).all()

@router.get("/demand", response_model=list[IndustryDemandOut])
def gov_demand(
    district_id: uuid.UUID | None = None,
    industry_sector_id: uuid.UUID | None = None,
    pagination: dict = Depends(get_pagination),
    current_user: User = Depends(require_roles("government_admin")),
    db: Session = Depends(get_db),
):
    stmt = select(IndustryDemand)
    if district_id:
        stmt = stmt.where(IndustryDemand.district_id == district_id)
    if industry_sector_id:
        stmt = stmt.where(IndustryDemand.industry_sector_id == industry_sector_id)
    return db.scalars(stmt.offset(pagination["skip"]).limit(pagination["limit"])).all()

@router.get("/training-supply")
def gov_training_supply(current_user: User = Depends(require_roles("government_admin"))):
    return {
        "status": "NOT_YET_AVAILABLE",
        "message": "Training capacity requires Phase 4 trainer/equipment schema.",
        "capabilities_pending": ["trainer_capacity", "equipment_inventory", "district_training_plans"],
    }
