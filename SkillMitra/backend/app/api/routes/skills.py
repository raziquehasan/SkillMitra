
import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_pagination
from app.schemas.skills import SkillResponse, SkillCategoryResponse, SkillProficiencyLevelResponse
from app.schemas.common import PaginatedResponse
from app.services.skill_service import SkillService

router = APIRouter(prefix="/api/v1/skills", tags=["Skills"])

@router.get("", response_model=PaginatedResponse[SkillResponse])
def list_skills(
    category_id: uuid.UUID | None = None,
    pagination: dict = Depends(get_pagination),
    db: Session = Depends(get_db)
):
    svc = SkillService(db)
    items, total = svc.get_skills(pagination["skip"], pagination["limit"], category_id)
    return {
        "items": items, "total": total,
        "page": pagination["page"], "page_size": pagination["page_size"],
        "pages": (total + pagination["page_size"] - 1) // pagination["page_size"]
    }

@router.get("/categories", response_model=list[SkillCategoryResponse])
def list_skill_categories(db: Session = Depends(get_db)):
    return SkillService(db).get_categories()

@router.get("/proficiency-levels", response_model=list[SkillProficiencyLevelResponse])
def list_proficiency_levels(db: Session = Depends(get_db)):
    return SkillService(db).get_proficiency_levels()
