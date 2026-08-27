
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import require_roles
from app.models.identity import User, Employer
from app.models.phase4 import CourseOffering, TrainingProvider
from app.api.routes.phase4 import OfferingOut
from pydantic import BaseModel, ConfigDict

router = APIRouter(prefix="/api/v1/training-providers", tags=["Training Providers"])


@router.get("/me/capacity")
def get_capacity_placeholder(
    current_user: User = Depends(require_roles("training_provider")),
    db: Session = Depends(get_db),
):
    provider = db.scalar(select(TrainingProvider).where(TrainingProvider.user_id == current_user.id))
    if not provider:
        return {
            "status": "NOT_YET_AVAILABLE",
            "message": "Create a training provider profile to expose capacity.",
        }
    offerings = db.scalars(select(CourseOffering).where(CourseOffering.provider_id == provider.id)).all()
    return [OfferingOut.model_validate({**offering.__dict__, "available_seats": offering.active_seats - offering.utilized_seats}) for offering in offerings]
