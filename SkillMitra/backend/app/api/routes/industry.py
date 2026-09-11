
"""Industry sector endpoints — public read."""
import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.demand import IndustrySector, IndustryDemand
from app.models.career import JobRole
from pydantic import BaseModel, ConfigDict

router = APIRouter(prefix="/api/v1/industry", tags=["Industry"])

class IndustrySectorOut(BaseModel):
    id: uuid.UUID
    name: str
    code: str | None = None
    description: str | None = None
    model_config = ConfigDict(from_attributes=True)

class JobRoleOut(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None = None
    is_active: bool
    model_config = ConfigDict(from_attributes=True)

@router.get("/sectors", response_model=list[IndustrySectorOut])
def list_sectors(db: Session = Depends(get_db)):
    return db.scalars(select(IndustrySector)).all()

@router.get("/sectors/{sector_id}", response_model=IndustrySectorOut)
def get_sector(sector_id: uuid.UUID, db: Session = Depends(get_db)):
    from fastapi import HTTPException
    sector = db.scalar(select(IndustrySector).where(IndustrySector.id == sector_id))
    if not sector:
        raise HTTPException(status_code=404, detail="Industry sector not found")
    return sector

@router.get("/job-roles", response_model=list[JobRoleOut])
def list_job_roles_by_district_sector(
    industry_sector_id: uuid.UUID | None = Query(None),
    district_id: uuid.UUID | None = Query(None),
    db: Session = Depends(get_db),
):
    """Get job roles filtered by industry sector and/or district.
    
    Uses the industry_demand table to find job roles that have demand
    in the specified sector and/or district. Falls back to all active
    job roles if no demand records exist.
    """
    stmt = select(JobRole).where(JobRole.is_active == True)
    
    if industry_sector_id or district_id:
        # Build a subquery to find job role IDs from industry_demand
        demand_stmt = select(IndustryDemand.job_role_id).distinct()
        
        if industry_sector_id:
            demand_stmt = demand_stmt.where(IndustryDemand.industry_sector_id == industry_sector_id)
        if district_id:
            demand_stmt = demand_stmt.where(IndustryDemand.district_id == district_id)
        
        role_ids = db.scalars(demand_stmt).all()
        
        if not role_ids:
            # Fallback: Return all active job roles if no demand records exist
            # This allows the Career Explorer to work even without demand data
            rows = db.scalars(stmt.order_by(JobRole.title)).all()
            return [JobRoleOut.model_validate(role) for role in rows]
        
        stmt = stmt.where(JobRole.id.in_(role_ids))
    
    rows = db.scalars(stmt.order_by(JobRole.title)).all()
    return [JobRoleOut.model_validate(role) for role in rows]
