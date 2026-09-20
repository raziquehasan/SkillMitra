
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


@router.get("/me/recommended-skills", response_model=dict,
            summary="Get recommended skills based on candidate profile and demand")
def get_my_recommended_skills(
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    """
    Returns prioritized recommended skills based on:
    - Candidate's current skills
    - Skill gaps from career interests
    - Industry demand
    - Job role requirements
    - Skill importance/proficiency
    """
    from app.models.phase4 import CandidateSkill
    from app.models.identity import CandidateProfile, CandidateCareerInterest
    from app.models.career import JobRole, JobRoleSkill
    from app.models.skills import Skill, SkillProficiencyLevel
    from app.models.demand import IndustryDemand
    from sqlalchemy import select, func
    from sqlalchemy.orm import selectinload

    # Get candidate profile
    profile = db.scalar(
        select(CandidateProfile).where(CandidateProfile.user_id == current_user.id)
    )

    if not profile:
        return {
            "recommended_skills": [],
            "reason": "Candidate profile not found"
        }

    # Get candidate skills
    candidate_skills = db.scalars(
        select(CandidateSkill)
        .where(CandidateSkill.candidate_id == profile.id)
        .options(selectinload(CandidateSkill.skill))
    ).all()
    candidate_skill_ids = {cs.skill_id for cs in candidate_skills}

    # Get career interests
    interests = db.scalars(
        select(CandidateCareerInterest)
        .where(CandidateCareerInterest.candidate_id == profile.id)
    ).all()

    if not interests:
        return {
            "recommended_skills": [],
            "reason": "Set career interests to get personalized skill recommendations"
        }

    # Collect missing skills from all career interests
    missing_skills_data = {}
    for interest in interests:
        role_skills = db.scalars(
            select(JobRoleSkill)
            .where(JobRoleSkill.job_role_id == interest.target_job_role_id)
            .options(selectinload(JobRoleSkill.skill))
        ).all()

        for rs in role_skills:
            if rs.skill_id not in candidate_skill_ids:
                skill = rs.skill
                if skill:
                    if skill.id not in missing_skills_data:
                        missing_skills_data[skill.id] = {
                            "skill_id": str(skill.id),
                            "skill_name": skill.name,
                            "category": skill.category.name if skill.category else None,
                            "required_proficiency": rs.proficiency_level.name if rs.proficiency_level else "Intermediate",
                            "importance": rs.importance or "preferred",
                            "related_job_roles": [],
                            "demand_score": 0
                        }
                    
                    missing_skills_data[skill.id]["related_job_roles"].append(interest.target_job_role_title or "Job Role")

    # If no missing skills, return empty
    if not missing_skills_data:
        return {
            "recommended_skills": [],
            "reason": "Your skills align well with your career interests"
        }

    # Get industry demand for skills
    skill_ids = list(missing_skills_data.keys())
    demand_data = db.scalars(
        select(IndustryDemand)
        .where(IndustryDemand.skill_id.in_(skill_ids))
    ).all()

    demand_scores = {d.skill_id: d.aggregate_demand_score or 0 for d in demand_data}

    # Enrich with demand data and calculate priority
    recommended_skills = []
    for skill_id, skill_data in missing_skills_data.items():
        demand_score = demand_scores.get(skill_id, 0)
        skill_data["demand_score"] = demand_score
        
        # Calculate priority based on importance and demand
        importance_weight = 3 if skill_data["importance"] == "mandatory" else 1
        demand_weight = min(demand_score / 100, 2) if demand_score else 0
        priority_score = importance_weight + demand_weight
        
        # Determine priority level
        if priority_score >= 4:
            priority = "Critical"
        elif priority_score >= 2:
            priority = "High"
        else:
            priority = "Medium"

        # Generate reason
        reason_parts = []
        if skill_data["importance"] == "mandatory":
            reason_parts.append("required for your selected career role")
        else:
            reason_parts.append("valuable for your career growth")
        
        if demand_score > 50:
            reason_parts.append("has high industry demand")
        
        reason = f"Recommended because this skill is {', and '.join(reason_parts)}."

        recommended_skills.append({
            **skill_data,
            "current_proficiency": None,
            "gap_status": "missing",
            "demand_relevance": "High" if demand_score > 50 else "Medium" if demand_score > 20 else "Low",
            "priority": priority,
            "reason": reason
        })

    # Sort by priority (Critical > High > Medium) and then by demand score
    priority_order = {"Critical": 0, "High": 1, "Medium": 2}
    recommended_skills.sort(key=lambda x: (priority_order.get(x["priority"], 3), -x["demand_score"]))

    return {
        "recommended_skills": recommended_skills[:10],  # Return top 10
        "reason": f"Based on your {len(interests)} career interest(s) and current skills"
    }


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
            summary="Get job recommendations based on candidate skills and industry demand")
def get_job_recommendations(
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    """
    Returns job recommendations based on candidate's skills and industry demand.
    Matches candidate skills with job posting requirements and prioritizes based on demand.
    """
    from app.models.market import JobPosting, JobPostingSkill
    from app.models.phase4 import CandidateSkill
    from app.models.identity import CandidateProfile
    from app.models.skills import Skill
    from app.models.demand import IndustryDemand
    from sqlalchemy import select, func
    from sqlalchemy.orm import selectinload

    # Get candidate profile
    profile = db.scalar(
        select(CandidateProfile).where(CandidateProfile.user_id == current_user.id)
    )

    if not profile:
        return {
            "recommended_jobs": [],
            "high_demand_jobs": [],
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
            "high_demand_jobs": [],
            "reason": "No skills in candidate profile. Add skills to get job recommendations."
        }

    # Get job postings with their skills, employer, and district
    job_postings = db.scalars(
        select(JobPosting)
        .where(JobPosting.status == "open")
        .options(
            selectinload(JobPosting.job_posting_skills).selectinload(JobPostingSkill.skill),
            selectinload(JobPosting.employer),
            selectinload(JobPosting.district),
            selectinload(JobPosting.job_role)
        )
    ).all()

    # Get industry demand data for job roles
    job_role_ids = {job.job_role_id for job in job_postings if job.job_role_id}
    demand_by_role = {}
    if job_role_ids:
        demand_rows = db.scalars(
            select(IndustryDemand).where(IndustryDemand.job_role_id.in_(job_role_ids))
        ).all()
        for demand in demand_rows:
            if demand.job_role_id not in demand_by_role:
                demand_by_role[demand.job_role_id] = {
                    "demand_score": demand.aggregate_demand_score or 0,
                    "demand_signals_count": 0,
                    "demand_trend": "Low"
                }
            # Update with highest demand score and count signals
            demand_by_role[demand.job_role_id]["demand_score"] = max(
                demand_by_role[demand.job_role_id]["demand_score"],
                demand.aggregate_demand_score or 0
            )
            demand_by_role[demand.job_role_id]["demand_signals_count"] += 1

    # Classify demand trends
    for role_id in demand_by_role:
        score = demand_by_role[role_id]["demand_score"]
        if score >= 7.5:
            demand_by_role[role_id]["demand_trend"] = "High"
        elif score >= 5.0:
            demand_by_role[role_id]["demand_trend"] = "Growing"
        elif score >= 2.5:
            demand_by_role[role_id]["demand_trend"] = "Moderate"
        else:
            demand_by_role[role_id]["demand_trend"] = "Low"

    recommended_jobs = []
    high_demand_jobs = []
    
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
            missing_skill_names = []
            for jps in job.job_posting_skills:
                if jps.skill:
                    required_skill_names.append(jps.skill.name)
                    if jps.skill_id not in candidate_skill_ids:
                        missing_skill_names.append(jps.skill.name)
            
            # Get demand information
            demand_info = demand_by_role.get(job.job_role_id, {
                "demand_score": 0,
                "demand_signals_count": 0,
                "demand_trend": "Low"
            })
            
            # Calculate recommendation score (skill match + demand)
            recommendation_score = match_score + (demand_info["demand_score"] * 5)
            
            job_data = {
                "id": str(job.id),
                "title": job.title,
                "company_name": job.employer.company_name if job.employer else "Unknown",
                "district_name": job.district.name if job.district else "Unknown",
                "skill_match_score": round(match_score),
                "required_skills": required_skill_names[:5],  # Show top 5 skills
                "missing_skills": missing_skill_names[:3],  # Show top 3 missing skills
                "job_url": job.job_url,
                "demand_trend": demand_info["demand_trend"],
                "demand_signals_count": demand_info["demand_signals_count"],
                "recommendation_score": round(recommendation_score, 1),
                "job_role_title": job.job_role.title if job.job_role else job.title
            }
            
            recommended_jobs.append(job_data)
            
            # Also add to high-demand jobs if demand is high or growing
            if demand_info["demand_trend"] in ["High", "Growing"]:
                high_demand_jobs.append(job_data)

    # Sort by recommendation score (skill match + demand)
    recommended_jobs.sort(key=lambda x: x["recommendation_score"], reverse=True)
    high_demand_jobs.sort(key=lambda x: x["recommendation_score"], reverse=True)

    return {
        "recommended_jobs": recommended_jobs[:10],  # Return top 10 recommendations
        "high_demand_jobs": high_demand_jobs[:5],  # Return top 5 high-demand jobs
        "reason": f"Found {len(recommended_jobs)} job opportunities matching your skills, including {len(high_demand_jobs)} high-demand opportunities"
    }
