
"""Industry sector endpoints — public read."""
import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
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
    industry_sector_id: uuid.UUID | None = None
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

@router.get("/job-roles", response_model=list[JobRoleOut], summary="Job roles by sector")
def get_job_roles(
    industry_sector_id: uuid.UUID | None = Query(None, description="Filter by industry sector"),
    district_id: uuid.UUID | None = Query(None, description="Filter by district (via demand records)"),
    db: Session = Depends(get_db),
):
    """
    Get job roles that can be filtered by industry sector and/or district.
    
    When industry_sector_id is provided, returns job roles associated with that sector.
    When district_id is provided, returns job roles that have demand records in that district.
    When both are provided, returns job roles matching both criteria.
    When neither is provided, returns all active job roles.
    """
    # Start with base query for active job roles with industry_sector relationship
    stmt = select(JobRole).where(JobRole.is_active == True).options(selectinload(JobRole.industry_sector))
    
    # If industry_sector_id is provided, filter by it
    if industry_sector_id:
        # Filter job roles that are associated with this sector
        # This can be either directly via job_roles.industry_sector_id
        # or via industry_demand records
        stmt = stmt.where(
            (JobRole.industry_sector_id == industry_sector_id) |
            (JobRole.id.in_(
                select(IndustryDemand.job_role_id).where(
                    IndustryDemand.industry_sector_id == industry_sector_id
                )
            ))
        )
    
    # If district_id is provided, filter by demand records in that district
    if district_id:
        stmt = stmt.where(
            JobRole.id.in_(
                select(IndustryDemand.job_role_id).where(
                    (IndustryDemand.district_id == district_id) &
                    (IndustryDemand.job_role_id.isnot(None))
                )
            )
        )
    
    job_roles = db.scalars(stmt).all()
    return [JobRoleOut.model_validate(role) for role in job_roles]
