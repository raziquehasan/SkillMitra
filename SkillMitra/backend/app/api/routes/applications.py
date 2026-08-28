
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import require_roles
from app.models.identity import User
from app.schemas.applications import ApplicationResponse, ApplicationCreate
from app.services.application_service import ApplicationService

router = APIRouter(prefix="/api/v1/applications", tags=["Applications"])

@router.post("", response_model=ApplicationResponse, status_code=201)
def apply_to_job(
    data: ApplicationCreate,
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db)
):
    return ApplicationService(db).apply_to_job(current_user.id, data.job_posting_id)
