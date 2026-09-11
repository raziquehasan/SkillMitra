
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_pagination
from app.schemas.jobs import JobResponse, JobDetailResponse
from app.schemas.common import PaginatedResponse
from app.services.job_service import JobService
from app.models.identity import Employer

router = APIRouter(prefix="/api/v1/jobs", tags=["Jobs"])

@router.get("", response_model=PaginatedResponse[JobResponse])
def list_jobs(
    district_id: uuid.UUID | None = None,
    job_role_id: uuid.UUID | None = None,
    exclude_test_employers: bool = True,  # Default to True for homepage
    pagination: dict = Depends(get_pagination),
    db: Session = Depends(get_db)
):
    svc = JobService(db)
    filters = {}
    if district_id:
        filters["district_id"] = district_id
    if job_role_id:
        filters["job_role_id"] = job_role_id
    
    items, total = svc.get_jobs(
        pagination["skip"], pagination["limit"],
        **filters
    )
    
    # Filter out test employers if requested (default behavior)
    if exclude_test_employers:
        # Only exclude specific test employer, not anything containing "skillmitra"
        test_employer_names = ["SkillMitra Labor Market", "Browser Test Company", "Test Company Pvt Ltd", "UI Test Company"]
        test_employers = db.scalars(
            select(Employer.id).where(Employer.company_name.in_(test_employer_names))
        ).all()
        if test_employers:
            items = [item for item in items if item.employer_id not in test_employers]
            total = len(items)
    
    return {
        "items": items, "total": total,
        "page": pagination["page"], "page_size": pagination["page_size"],
        "pages": (total + pagination["page_size"] - 1) // pagination["page_size"]
    }

@router.get("/{job_id}", response_model=JobDetailResponse)
def get_job(job_id: uuid.UUID, db: Session = Depends(get_db)):
    return JobService(db).get_job(job_id)
