"""Geography endpoints - districts, states."""
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.models.geography import District, State
from pydantic import BaseModel, ConfigDict
import uuid

router = APIRouter(prefix="/api/v1/geography", tags=["Geography"])


class DistrictOut(BaseModel):
    id: uuid.UUID
    name: str
    code: str | None = None
    state_code: str | None = None
    model_config = ConfigDict(from_attributes=True)


class StateOut(BaseModel):
    id: uuid.UUID
    name: str
    code: str
    model_config = ConfigDict(from_attributes=True)


@router.get("/districts", response_model=list[DistrictOut])
def get_districts(db: Session = Depends(get_db)):
    districts = db.scalars(
        select(District)
        .options(joinedload(District.state))
        .order_by(District.name)
    ).all()
    return [
        DistrictOut(
            id=district.id, 
            name=district.name, 
            code=district.code, 
            state_code=district.state.code if district.state else None
        )
        for district in districts
    ]


@router.get("/states", response_model=list[StateOut])
def get_states(db: Session = Depends(get_db)):
    return db.scalars(select(State).order_by(State.name)).all()
