
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_pagination
from app.schemas.courses import CourseResponse, CourseDetailResponse
from app.schemas.common import PaginatedResponse
from app.services.course_service import CourseService

router = APIRouter(prefix="/api/v1/courses", tags=["Courses"])

@router.get("", response_model=PaginatedResponse[CourseResponse])
def list_courses(
    pagination: dict = Depends(get_pagination),
    db: Session = Depends(get_db)
):
    svc = CourseService(db)
    items, total = svc.get_courses(pagination["skip"], pagination["limit"])
    return {
        "items": items, "total": total,
        "page": pagination["page"], "page_size": pagination["page_size"],
        "pages": (total + pagination["page_size"] - 1) // pagination["page_size"]
    }

@router.get("/{course_id}", response_model=CourseDetailResponse)
def get_course(course_id: uuid.UUID, db: Session = Depends(get_db)):
    return CourseService(db).get_course(course_id)
