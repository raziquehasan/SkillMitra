"""Job role endpoints — public read."""
import uuid

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.career import JobRole

router = APIRouter(prefix="/api/v1/job-roles", tags=["Job Roles"])


class JobRoleOut(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None = None
    is_active: bool
    model_config = ConfigDict(from_attributes=True)


@router.get("", response_model=list[JobRoleOut])
def list_job_roles(
    industry_sector_id: uuid.UUID | None = Query(None),
    db: Session = Depends(get_db),
):
    stmt = select(JobRole).where(JobRole.is_active == True)
    if industry_sector_id:
        from app.models.demand import IndustryDemand
        role_ids = db.scalars(
            select(IndustryDemand.job_role_id)
            .where(IndustryDemand.industry_sector_id == industry_sector_id)
            .distinct()
        ).all()
        if not role_ids:
            return []
        stmt = stmt.where(JobRole.id.in_(role_ids))
    rows = db.scalars(stmt.order_by(JobRole.title)).all()
    return [JobRoleOut.model_validate(role) for role in rows]


@router.get("/{role_id}", response_model=JobRoleOut)
def get_job_role(role_id: uuid.UUID, db: Session = Depends(get_db)):
    role = db.scalar(select(JobRole).where(JobRole.id == role_id))
    if not role:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Job role not found")
    return JobRoleOut.model_validate(role)
