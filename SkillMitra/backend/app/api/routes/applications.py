
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import require_roles
from app.models.identity import User
from app.schemas.applications import ApplicationResponse, ApplicationCreate
from app.services.application_service import ApplicationService
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/applications", tags=["Applications"])

@router.get("", response_model=list[ApplicationResponse])
def get_my_applications(
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db)
):
    return ApplicationService(db).get_my_applications(current_user.id)

@router.post("", response_model=ApplicationResponse, status_code=201)
def apply_to_job(
    data: ApplicationCreate,
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db)
):
    try:
        return ApplicationService(db).apply_to_job(current_user.id, data.job_posting_id)
    except Exception as e:
        if "Already applied" in str(e):
            raise HTTPException(status_code=409, detail="Already applied to this job")
        raise

class CourseApplicationRequest(BaseModel):
    course_id: uuid.UUID

@router.get("/courses", response_model=list[dict])
def get_my_course_applications(
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db)
):
    """
    Get candidate's course applications/enrollments.
    Returns both pending applications and enrollments.
    """
    from app.models.career import CourseEnrollment, Course
    from app.models.identity import CandidateProfile
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    
    profile = db.scalar(
        select(CandidateProfile).where(CandidateProfile.user_id == current_user.id)
    )
    
    if not profile:
        return []
    
    enrollments = db.scalars(
        select(CourseEnrollment)
        .where(CourseEnrollment.candidate_id == profile.id)
        .options(selectinload(CourseEnrollment.course))
    ).all()
    
    result = []
    for enrollment in enrollments:
        course = enrollment.course
        result.append({
            "id": str(enrollment.id),
            "course_id": str(enrollment.course_id),
            "type": "enrollment",
            "status": enrollment.status,
            "applied_date": enrollment.enrollment_date.isoformat() if enrollment.enrollment_date else None,
            "course_title": course.title if course else None,
            "course_provider": None,  # Would need provider relationship
            "course_location": None,  # Would need district relationship
        })
    
    return result

@router.post("/courses", response_model=dict, status_code=201)
def apply_for_course(
    data: CourseApplicationRequest,
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db)
):
    """
    Apply for a course (creates enrollment).
    This endpoint delegates to the enrollment endpoint for consistency.
    """
    from app.models.career import CourseEnrollment, Course
    from app.models.identity import CandidateProfile
    from sqlalchemy import select
    from datetime import date
    
    # Get candidate profile
    profile = db.scalar(
        select(CandidateProfile).where(CandidateProfile.user_id == current_user.id)
    )
    
    if not profile:
        raise HTTPException(status_code=404, detail="Candidate profile not found")
    
    # Check if course exists
    course = db.scalar(select(Course).where(Course.id == data.course_id))
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Check if already enrolled/applied
    existing_enrollment = db.scalar(
        select(CourseEnrollment)
        .where(CourseEnrollment.candidate_id == profile.id)
        .where(CourseEnrollment.course_id == data.course_id)
    )
    
    if existing_enrollment:
        if existing_enrollment.status == "enrolled":
            raise HTTPException(status_code=400, detail="Already enrolled in this course")
        elif existing_enrollment.status == "completed":
            raise HTTPException(status_code=400, detail="Already completed this course")
        else:
            raise HTTPException(status_code=400, detail="Already applied for this course")
    
    # Create new enrollment (course application)
    enrollment = CourseEnrollment(
        candidate_id=profile.id,
        course_id=data.course_id,
        status="enrolled",  # Direct enrollment for now
        enrollment_date=date.today()
    )
    
    db.add(enrollment)
    
    try:
        db.commit()
        db.refresh(enrollment)
    except Exception as e:
        db.rollback()
        if "unique constraint" in str(e).lower() or "uq_enrollment_candidate_course" in str(e):
            raise HTTPException(status_code=400, detail="Already enrolled in this course")
        raise HTTPException(status_code=500, detail="Failed to apply for course")
    
    return {
        "id": str(enrollment.id),
        "course_id": str(enrollment.course_id),
        "status": enrollment.status,
        "enrollment_date": enrollment.enrollment_date.isoformat() if enrollment.enrollment_date else None,
        "message": "Successfully applied for course"
    }
