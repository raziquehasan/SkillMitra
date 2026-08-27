"""Demand Intelligence API."""
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_pagination
from app.models.demand import DemandSignal, IndustryDemand
from pydantic import BaseModel, ConfigDict

router = APIRouter(prefix="/api/v1/demand", tags=["Demand Intelligence"])

class DemandSignalOut(BaseModel):
    id: uuid.UUID
    skill_id: uuid.UUID | None = None
    job_role_id: uuid.UUID | None = None
    district_id: uuid.UUID | None = None
    raw_weight: float | None = None
    scaled_weight: float | None = None
    model_config = ConfigDict(from_attributes=True)

class IndustryDemandOut(BaseModel):
    id: uuid.UUID
    industry_sector_id: uuid.UUID
    job_role_id: uuid.UUID | None = None
    skill_id: uuid.UUID | None = None
    district_id: uuid.UUID | None = None
    aggregate_demand_score: float | None = None
    period_start: str | None = None
    period_end: str | None = None
    model_config = ConfigDict(from_attributes=True)

@router.get("", response_model=list[DemandSignalOut], summary="Demand signals")
def get_demand(
    district_id: uuid.UUID | None = None,
    skill_id: uuid.UUID | None = None,
    job_role_id: uuid.UUID | None = None,
    pagination: dict = Depends(get_pagination),
    db: Session = Depends(get_db),
):
    stmt = select(DemandSignal)
    if district_id:
        stmt = stmt.where(DemandSignal.district_id == district_id)
    if skill_id:
        stmt = stmt.where(DemandSignal.skill_id == skill_id)
    if job_role_id:
        stmt = stmt.where(DemandSignal.job_role_id == job_role_id)
    return db.scalars(stmt.offset(pagination["skip"]).limit(pagination["limit"])).all()

@router.get("/industries", response_model=list[IndustryDemandOut], summary="Industry demand")
def get_demand_by_industry(
    industry_sector_id: uuid.UUID | None = None,
    district_id: uuid.UUID | None = None,
    pagination: dict = Depends(get_pagination),
    db: Session = Depends(get_db),
):
    stmt = select(IndustryDemand)
    if industry_sector_id:
        stmt = stmt.where(IndustryDemand.industry_sector_id == industry_sector_id)
    if district_id:
        stmt = stmt.where(IndustryDemand.district_id == district_id)
    items = db.scalars(stmt.offset(pagination["skip"]).limit(pagination["limit"])).all()
    return [
        IndustryDemandOut(
            id=r.id, industry_sector_id=r.industry_sector_id, job_role_id=r.job_role_id,
            skill_id=r.skill_id, district_id=r.district_id,
            aggregate_demand_score=r.aggregate_demand_score,
            period_start=str(r.period_start) if r.period_start else None,
            period_end=str(r.period_end) if r.period_end else None,
        )
        for r in items
    ]
