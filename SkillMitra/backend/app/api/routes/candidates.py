
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import require_roles
from app.models.identity import User, CandidateProfile
from app.schemas.candidates import (
    CandidateProfileResponse, CandidateProfileUpdate,
    CandidateEducationResponse, CandidateEducationCreate,
    CandidateInterestResponse, CandidateInterestCreate,
    SkillGapResponse, CandidateSkillResponse, CandidateSkillCreate, CandidateSkillUpdate,
    SkillVerificationRequest,
)
from app.schemas.common import MessageResponse
from app.services.candidate_service import CandidateService
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/candidates", tags=["Candidates"])


@router.get("/me", response_model=CandidateProfileResponse,
            summary="Get my candidate profile")
def get_my_profile(
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    profile = CandidateService(db).get_or_create_profile(current_user.id)
    response = CandidateProfileResponse.from_profile_with_user(profile)
    
    # Calculate profile completion percentage
    completion = CandidateService(db).calculate_profile_completion(profile)
    response.profile_completion = completion
    
    return response


@router.patch("/me", response_model=CandidateProfileResponse,
              summary="Update my candidate profile")
def update_my_profile(
    data: CandidateProfileUpdate,
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    profile = CandidateService(db).update_profile(current_user.id, data)
    return CandidateProfileResponse.from_profile_with_user(profile)


@router.get("/me/education", response_model=list[CandidateEducationResponse],
            summary="List my education records")
def get_my_education(
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    profile = CandidateService(db).get_or_create_profile(current_user.id)
    return profile.education_history


@router.post("/me/education", response_model=CandidateEducationResponse,
             status_code=201, summary="Add education record")
def add_my_education(
    data: CandidateEducationCreate,
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    return CandidateService(db).add_education(current_user.id, data)


@router.delete("/me/education/{education_id}", response_model=MessageResponse,
               summary="Delete education record")
def delete_my_education(
    education_id: uuid.UUID,
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    CandidateService(db).delete_education(current_user.id, education_id)
    return {"message": "Deleted successfully"}


@router.get("/me/interests", response_model=list[CandidateInterestResponse],
            summary="Get my career interests")
def get_my_interests(
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    profile = CandidateService(db).get_or_create_profile(current_user.id)
    return profile.career_interests


@router.post("/me/interests", response_model=CandidateInterestResponse,
             status_code=201, summary="Add career interest")
def add_my_interest(
    data: CandidateInterestCreate,
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    return CandidateService(db).add_interest(current_user.id, data)


@router.delete("/me/interests/{interest_id}", response_model=MessageResponse,
               summary="Remove career interest")
def delete_my_interest(
    interest_id: uuid.UUID,
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    CandidateService(db).delete_interest(current_user.id, interest_id)
    return {"message": "Deleted successfully"}


@router.get("/me/skill-gaps", response_model=list[SkillGapResponse],
            summary="Skill gaps vs job role requirements")
def get_my_skill_gaps(
    job_role_id: uuid.UUID | None = None,
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    return CandidateService(db).get_skill_gaps(current_user.id, job_role_id)


@router.get("/me/skills", response_model=list[CandidateSkillResponse],
            summary="List my skills")
def get_my_skills(
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    return CandidateService(db).list_skills(current_user.id)


@router.post("/me/skills", response_model=CandidateSkillResponse, status_code=201,
             summary="Add a skill to my profile")
def add_my_skill(
    data: CandidateSkillCreate,
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    return CandidateService(db).add_skill(current_user.id, data)


@router.patch("/me/skills/{skill_id}", response_model=CandidateSkillResponse,
              summary="Update my skill")
def update_my_skill(
    skill_id: uuid.UUID,
    data: CandidateSkillUpdate,
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    return CandidateService(db).update_skill(current_user.id, skill_id, data)


@router.delete("/me/skills/{skill_id}", response_model=MessageResponse,
               summary="Remove my skill")
def delete_my_skill(
    skill_id: uuid.UUID,
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    CandidateService(db).delete_skill(current_user.id, skill_id)
    return {"message": "Deleted successfully"}


@router.post("/me/skills/{skill_id}/verify", response_model=CandidateSkillResponse,
             summary="Request verification for my skill")
def request_skill_verification(
    skill_id: uuid.UUID,
    data: SkillVerificationRequest,
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    return CandidateService(db).request_skill_verification(current_user.id, skill_id, data)


@router.get("/me/enrollments", response_model=list[dict],
            summary="List my course enrollments")
def get_my_enrollments(
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    """
    Returns the candidate's course enrollments with course details.
    """
    from app.models.career import CourseEnrollment, Course
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload

    profile = db.scalar(
        select(CandidateProfile)
        .where(CandidateProfile.user_id == current_user.id)
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
            "status": enrollment.status,
            "enrollment_date": enrollment.enrollment_date.isoformat() if enrollment.enrollment_date else None,
            "completion_date": enrollment.completion_date.isoformat() if enrollment.completion_date else None,
            "grade_outcome": enrollment.grade_outcome,
            "course": {
                "id": str(course.id),
                "title": course.title,
                "description": course.description,
                "duration_hours": course.duration_hours,
                "delivery_mode": course.delivery_mode,
                "status": course.status,
            } if course else None
        })

    return result


class CourseEnrollmentRequest(BaseModel):
    course_id: uuid.UUID

@router.post("/me/enrollments", response_model=dict,
             summary="Enroll in a course")
def enroll_in_course(
    data: CourseEnrollmentRequest,
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    """
    Enroll the candidate in a course.
    Prevents duplicate enrollments using the database unique constraint.
    """
    from app.models.career import CourseEnrollment, Course
    from app.models.identity import CandidateProfile
    from sqlalchemy import select
    from datetime import date

    # Get candidate profile
    profile = db.scalar(
        select(CandidateProfile)
        .where(CandidateProfile.user_id == current_user.id)
    )

    if not profile:
        raise HTTPException(status_code=404, detail="Candidate profile not found")

    # Check if course exists
    course = db.scalar(select(Course).where(Course.id == data.course_id))
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Check if already enrolled - the unique constraint will handle this,
    # but we check for a better error message
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

    # Create new enrollment
    enrollment = CourseEnrollment(
        candidate_id=profile.id,
        course_id=data.course_id,
        status="enrolled",
        enrollment_date=date.today()
    )

    db.add(enrollment)
    
    try:
        db.commit()
        db.refresh(enrollment)
    except Exception as e:
        db.rollback()
        # Check if it's a unique constraint violation
        if "unique constraint" in str(e).lower() or "uq_enrollment_candidate_course" in str(e):
            raise HTTPException(status_code=400, detail="Already enrolled in this course")
        raise HTTPException(status_code=500, detail="Failed to enroll in course")

    return {
        "id": str(enrollment.id),
        "course_id": str(enrollment.course_id),
        "status": enrollment.status,
        "enrollment_date": enrollment.enrollment_date.isoformat() if enrollment.enrollment_date else None,
        "message": "Successfully enrolled in course"
    }


@router.get("/me/training-recommendations", response_model=dict,
            summary="Get training recommendations based on skill gaps")
def get_training_recommendations(
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    """
    Returns training recommendations based on candidate's skill gaps.
    Uses skill gap analysis to find courses that address missing skills.
    """
    from app.models.career import Course, CourseSkill
    from app.models.phase4 import CandidateSkill
    from app.models.identity import CandidateProfile
    from app.models.skills import Skill
    from sqlalchemy import select, func
    from sqlalchemy.orm import selectinload

    # Get candidate profile
    profile = db.scalar(
        select(CandidateProfile).where(CandidateProfile.user_id == current_user.id)
    )

    if not profile:
        return {
            "recommended_courses": [],
            "missing_skills": []
        }

    # Get candidate skills
    candidate_skills = db.scalars(
        select(CandidateSkill).where(CandidateSkill.candidate_id == profile.id)
    ).all()
    candidate_skill_ids = {cs.skill_id for cs in candidate_skills}

    # Get skill gaps from candidate's career interests
    from app.models.career import JobRole, JobRoleSkill
    from app.models.identity import CandidateCareerInterest
    
    interests = db.scalars(
        select(CandidateCareerInterest)
        .where(CandidateCareerInterest.candidate_id == profile.id)
    ).all()

    missing_skills = set()
    if interests:
        for interest in interests:
            role_skills = db.scalars(
                select(JobRoleSkill)
                .where(JobRoleSkill.job_role_id == interest.target_job_role_id)
            ).all()
            for rs in role_skills:
                if rs.skill_id not in candidate_skill_ids:
                    skill = db.scalar(select(Skill).where(Skill.id == rs.skill_id))
                    if skill:
                        missing_skills.add(skill.name)

    # If no missing skills from interests, return empty
    if not missing_skills:
        return {
            "recommended_courses": [],
            "missing_skills": []
        }

    # Find courses that cover missing skills
    missing_skill_ids = list(missing_skills)
    recommended_courses = []

    # Get courses with their skills
    courses = db.scalars(
        select(Course)
        .where(Course.status == "active")
        .options(selectinload(Course.course_skills).selectinload(CourseSkill.skill))
    ).all()

    for course in courses:
        course_skill_names = {cs.skill.name for cs in course.course_skills if cs.skill}
        # Calculate overlap with missing skills
        addressed_gaps = course_skill_names.intersection(missing_skills)
        
        if addressed_gaps:
            # Calculate relevance score based on number of gaps addressed
            relevance_score = min(100, len(addressed_gaps) * 25)
            
            recommended_courses.append({
                "course_id": str(course.id),
                "course_title": course.title,
                "description": course.description,
                "gap_relevance_score": relevance_score,
                "addresses_gaps": list(addressed_gaps),
                "reason": f"Addresses {len(addressed_gaps)} of your missing skills"
            })

    # Sort by relevance score
    recommended_courses.sort(key=lambda x: x["gap_relevance_score"], reverse=True)

    return {
        "recommended_courses": recommended_courses[:5],  # Return top 5 recommendations
        "missing_skills": list(missing_skills)
    }


@router.get("/me/job-recommendations", response_model=dict,
            summary="Get job recommendations based on candidate skills")
def get_job_recommendations(
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    """
    Returns job recommendations based on candidate's skills.
    Matches candidate skills with job posting requirements.
    """
    from app.models.market import JobPosting, JobPostingSkill
    from app.models.phase4 import CandidateSkill
    from app.models.identity import CandidateProfile
    from app.models.skills import Skill
    from sqlalchemy import select, func
    from sqlalchemy.orm import selectinload

    # Get candidate profile
    profile = db.scalar(
        select(CandidateProfile).where(CandidateProfile.user_id == current_user.id)
    )

    if not profile:
        return {
            "recommended_jobs": [],
            "reason": "Candidate profile not found"
        }

    # Get candidate skills
    candidate_skills = db.scalars(
        select(CandidateSkill).where(CandidateSkill.candidate_id == profile.id)
    ).all()
    candidate_skill_ids = {cs.skill_id for cs in candidate_skills}

    if not candidate_skill_ids:
        return {
            "recommended_jobs": [],
            "reason": "No skills in candidate profile. Add skills to get job recommendations."
        }

    # Get job postings with their skills, employer, and district
    job_postings = db.scalars(
        select(JobPosting)
        .where(JobPosting.status == "open")
        .options(
            selectinload(JobPosting.job_posting_skills).selectinload(JobPostingSkill.skill),
            selectinload(JobPosting.employer),
            selectinload(JobPosting.district)
        )
    ).all()

    recommended_jobs = []
    for job in job_postings:
        # Get skill IDs required for this job
        job_skill_ids = {jps.skill_id for jps in job.job_posting_skills if jps.skill}
        
        if not job_skill_ids:
            continue
        
        # Calculate skill match
        matched_skills = candidate_skill_ids.intersection(job_skill_ids)
        match_score = len(matched_skills) / len(job_skill_ids) * 100 if job_skill_ids else 0
        
        # Only include jobs with at least 50% skill match
        if match_score >= 50:
            # Get skill names for required skills
            required_skill_names = []
            for jps in job.job_posting_skills:
                if jps.skill:
                    required_skill_names.append(jps.skill.name)
            
            recommended_jobs.append({
                "id": str(job.id),
                "title": job.title,
                "company_name": job.employer.company_name if job.employer else "Unknown",
                "district_name": job.district.name if job.district else "Unknown",
                "skill_match_score": round(match_score),
                "required_skills": required_skill_names[:5],  # Show top 5 skills
                "job_url": job.job_url
            })

    # Sort by match score
    recommended_jobs.sort(key=lambda x: x["skill_match_score"], reverse=True)

    return {
        "recommended_jobs": recommended_jobs[:10],  # Return top 10 recommendations
        "reason": f"Found {len(recommended_jobs)} job opportunities matching your skills"
    }
