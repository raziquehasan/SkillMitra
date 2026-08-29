"""Public geography reads for Maharashtra district planning surfaces."""
import uuid

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.geography import District, State

router = APIRouter(prefix="/api/v1/geography", tags=["Geography"])


class DistrictOut(BaseModel):
    id: uuid.UUID
    name: str
    code: str | None = None
    state_code: str | None = None
    model_config = ConfigDict(from_attributes=True)


@router.get("/districts", response_model=list[DistrictOut])
def list_districts(
    state_code: str = Query("MH", min_length=1, max_length=10),
    db: Session = Depends(get_db),
):
    rows = db.execute(
        select(District, State.code)
        .join(State, District.state_id == State.id)
        .where(State.code == state_code)
        .order_by(District.name)
    ).all()
    return [
        DistrictOut(id=district.id, name=district.name, code=district.code, state_code=code)
        for district, code in rows
    ]
