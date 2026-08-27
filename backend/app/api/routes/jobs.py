
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_pagination
from app.schemas.jobs import JobResponse, JobDetailResponse
from app.schemas.common import PaginatedResponse
from app.services.job_service import JobService

router = APIRouter(prefix="/api/v1/jobs", tags=["Jobs"])

@router.get("", response_model=PaginatedResponse[JobResponse])
def list_jobs(
    district_id: uuid.UUID | None = None,
    job_role_id: uuid.UUID | None = None,
    pagination: dict = Depends(get_pagination),
    db: Session = Depends(get_db)
):
    svc = JobService(db)
    items, total = svc.get_jobs(
        pagination["skip"], pagination["limit"],
        district_id=district_id, job_role_id=job_role_id
    )
    return {
        "items": items, "total": total,
        "page": pagination["page"], "page_size": pagination["page_size"],
        "pages": (total + pagination["page_size"] - 1) // pagination["page_size"]
    }

@router.get("/{job_id}", response_model=JobDetailResponse)
def get_job(job_id: uuid.UUID, db: Session = Depends(get_db)):
    return JobService(db).get_job(job_id)
