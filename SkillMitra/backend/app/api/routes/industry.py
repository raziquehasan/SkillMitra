
"""Industry sector endpoints — public read."""
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.demand import IndustrySector
from pydantic import BaseModel, ConfigDict

router = APIRouter(prefix="/api/v1/industry", tags=["Industry"])

class IndustrySectorOut(BaseModel):
    id: uuid.UUID
    name: str
    code: str | None = None
    description: str | None = None
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
