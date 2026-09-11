
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_pagination
from app.schemas.courses import CourseResponse, CourseDetailResponse
from app.schemas.common import PaginatedResponse
from app.services.course_service import CourseService
from pydantic import BaseModel, ConfigDict
from app.services.training_alignment_service import CourseAlignmentService
from app.services.course_health_service import CourseHealthScoreService

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


class HomepageCourseResponse(BaseModel):
    id: str
    title: str
    demandLevel: str
    district: str | None
    skills: list[str]
    durationHours: int | None
    courseUrl: str | None
    providerUrl: str | None
    providerName: str | None
    relatedProgrammeName: str | None = None  # Name of related programme if isRelatedProgramme is true
    isRelatedProgramme: bool = False  # True if this is a related pathway, not direct provider
    isListingUrl: bool = False  # True if URL is a listing page, not course-specific


@router.get("/homepage", response_model=list[HomepageCourseResponse])
def get_homepage_courses(db: Session = Depends(get_db)):
    """
    Get recommended courses for the homepage with verified source mappings.
    
    Returns courses with verified official URLs from real providers:
    - C-DAC PGCP-BDA (Big Data Analytics)
    - C-DAC PGCP-AI (Artificial Intelligence)
    - Government ITI Aundh Pune - Automotive CNC Machining Technician
    - Maharashtra Government ITI - Solar PV Installer (Suryamitra)
    
    Excludes legacy and typing courses. Only shows courses with verified URLs.
    """
    svc = CourseService(db)
    return svc.get_homepage_courses()


@router.get("/{course_id}", response_model=CourseDetailResponse)
def get_course(course_id: uuid.UUID, db: Session = Depends(get_db)):
    return CourseService(db).get_course(course_id)


class CourseAlignmentOut(BaseModel):
    demand_id: str
    skill_id: str
    coverage_status: str
    matching_courses: list[dict]


@router.get("/alignment/demand/{demand_id}", response_model=CourseAlignmentOut)
def get_course_alignment_for_demand(
    demand_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    svc = CourseAlignmentService(db)
    result = svc.get_course_skill_coverage(str(demand_id))
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


class SkillGapAnalysisOut(BaseModel):
    job_role_id: str
    required_skills: list[str]
    course_analysis: list[dict]


@router.get("/alignment/skill-gap/{job_role_id}", response_model=SkillGapAnalysisOut)
def get_skill_gap_analysis(
    job_role_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    svc = CourseAlignmentService(db)
    result = svc.get_skill_gap_analysis(str(job_role_id))
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


class CourseHealthOut(BaseModel):
    course_id: str
    course_title: str
    demand_score: float | None = None
    skill_alignment_score: float | None = None
    placement_score: float | None = None
    employer_validation_score: float | None = None
    technology_relevance_score: float | None = None
    supply_demand_score: float | None = None
    overall_score: float | None = None
    status: str
    recommended_status: str
    review_status: str
    final_status: str | None = None
    explanation: str
    data_completeness: dict
    period_start: str | None = None
    period_end: str | None = None
    calculated_at: str | None = None
    model_config = ConfigDict(from_attributes=True)


@router.get("/health/{course_id}", response_model=CourseHealthOut)
def get_course_health(
    course_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    svc = CourseHealthScoreService(db)
    result = svc.calculate_course_health(str(course_id))
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result

