
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import require_roles
from app.models.identity import User, Employer
from pydantic import BaseModel, ConfigDict

router = APIRouter(prefix="/api/v1/training-providers", tags=["Training Providers"])


@router.get("/me/capacity")
def get_capacity_placeholder(
    current_user: User = Depends(require_roles("training_provider")),
):
    return {
        "status": "NOT_YET_AVAILABLE",
        "message": "Capacity management requires Phase 4 trainer/equipment schema.",
        "capabilities_pending": ["trainers", "trainer_skills", "equipment", "course_equipment"],
    }
