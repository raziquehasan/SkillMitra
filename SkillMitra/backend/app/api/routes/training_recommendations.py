"""
Training recommendations based on candidate skill gaps.
"""

import uuid
from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.orm import Session, selectinload
from app.core.database import get_db
from app.core.auth import require_roles
from app.models.identity import User, CandidateProfile
from app.models.phase4 import CandidateSkill
from app.models.career import Course, CourseSkill, JobRole, JobRoleSkill
from app.models.skills import Skill
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/candidates/me/training-recommendations", tags=["Training Recommendations"])


class RecommendedCourse(BaseModel):
    """Course recommendation with gap information."""
    course_id: str
    course_title: str
    description: str | None
    duration_hours: int | None
    delivery_mode: str | None
    status: str
    skills_taught: list[str]
    addresses_gaps: list[str]
    gap_relevance_score: float
    reason: str


class TrainingRecommendationsResponse(BaseModel):
    """Response with recommended courses based on skill gaps."""
    missing_skills: list[str]
    recommended_courses: list[RecommendedCourse]
    total_gaps: int
    courses_available: int
    reason: str | None = None


@router.get("", response_model=TrainingRecommendationsResponse)
def get_training_recommendations(
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    """
    Get training recommendations based on candidate skill gaps.
    
    Flow:
    1. Get candidate's confirmed skills
    2. Get candidate's career interests (target job roles)
    3. Calculate skill gaps for each target role
    4. Find courses that teach missing skills
    5. Rank courses by gap relevance
    """
    # Get candidate profile with career interests
    profile = db.scalar(
        select(CandidateProfile)
        .where(CandidateProfile.user_id == current_user.id)
        .options(selectinload(CandidateProfile.career_interests))
    )
    if not profile:
        # Count total active courses
        total_active_courses = db.scalar(
            select(func.count()).select_from(Course).where(Course.status == 'active')
        ) or 0
        return TrainingRecommendationsResponse(
            missing_skills=[],
            recommended_courses=[],
            total_gaps=0,
            courses_available=total_active_courses,
            reason="Candidate profile not found"
        )
    
    # Get candidate's current skills
    candidate_skills = db.scalars(
        select(CandidateSkill.skill_id).where(CandidateSkill.candidate_id == profile.id)
    ).all()
    candidate_skill_ids = set(candidate_skills)
    
    # Count total active courses for courses_available field
    total_active_courses = db.scalar(
        select(func.count()).select_from(Course).where(Course.status == 'active')
    ) or 0
    
    # Get candidate's career interests (target job roles)
    if not profile.career_interests:
        return TrainingRecommendationsResponse(
            missing_skills=[],
            recommended_courses=[],
            total_gaps=0,
            courses_available=total_active_courses,
            reason="Please set career interests to get personalized training recommendations"
        )
    
    # Collect all missing skills from target roles
    all_missing_skills = set()
    target_roles = []
    
    for interest in profile.career_interests:
        role = db.scalar(
            select(JobRole)
            .where(JobRole.id == interest.target_job_role_id)
            .options(selectinload(JobRole.job_role_skills))
        )
        if not role:
            continue
        
        target_roles.append(role)
        
        # Find missing skills for this role
        for jrs in role.job_role_skills:
            if jrs.skill_id not in candidate_skill_ids:
                all_missing_skills.add(jrs.skill_id)
    
    if not all_missing_skills:
        return TrainingRecommendationsResponse(
            missing_skills=[],
            recommended_courses=[],
            total_gaps=0,
            courses_available=total_active_courses,
            reason="No skill gaps found - your skills match your target roles"
        )
    
    # Get skill names for missing skills
    missing_skill_objs = db.scalars(
        select(Skill).where(Skill.id.in_(all_missing_skills))
    ).all()
    missing_skill_names = {skill.id: skill.name for skill in missing_skill_objs}
    
    # Find courses that teach missing skills
    missing_skill_ids_list = list(all_missing_skills)
    
    # Get all courses with their skills
    courses_with_skills = db.execute(
        select(Course, CourseSkill.skill_id)
        .join(CourseSkill, Course.id == CourseSkill.course_id)
        .where(Course.status == 'active')
        .where(CourseSkill.skill_id.in_(missing_skill_ids_list))
        .distinct()
    ).all()
    
    # Build course recommendations
    course_recommendations = {}
    
    for course, skill_id in courses_with_skills:
        if course.id not in course_recommendations:
            course_recommendations[course.id] = {
                "course": course,
                "addresses_gaps": set(),
                "skills_taught": set()
            }
        
        course_recommendations[course.id]["addresses_gaps"].add(skill_id)
        course_recommendations[course.id]["skills_taught"].add(skill_id)
    
    # Get all skills for each recommended course
    for course_id in course_recommendations:
        course_skills = db.scalars(
            select(CourseSkill.skill_id)
            .where(CourseSkill.course_id == course_id)
        ).all()
        course_recommendations[course_id]["skills_taught"] = set(course_skills)
    
    # Calculate relevance score and build response
    recommended_courses = []
    
    for course_id, course_data in course_recommendations.items():
        course = course_data["course"]
        addresses_gaps = course_data["addresses_gaps"]
        skills_taught = course_data["skills_taught"]
        
        # Relevance score: how many missing skills this course addresses
        gap_relevance_score = len(addresses_gaps) / len(all_missing_skills) if all_missing_skills else 0
        
        # Get skill names
        addresses_gap_names = [
            missing_skill_names.get(skill_id, "Unknown Skill")
            for skill_id in addresses_gaps
        ]
        
        skills_taught_names = []
        for skill_id in skills_taught:
            skill = db.scalar(select(Skill).where(Skill.id == skill_id))
            if skill:
                skills_taught_names.append(skill.name)
        
        # Build reason
        reason_parts = []
        if addresses_gap_names:
            reason_parts.append(f"Addresses {len(addresses_gap_names)} of your skill gaps")
        if gap_relevance_score > 0.5:
            reason_parts.append("High relevance to your career goals")
        
        recommended_courses.append(RecommendedCourse(
            course_id=str(course.id),
            course_title=course.title,
            description=course.description,
            duration_hours=course.duration_hours,
            delivery_mode=course.delivery_mode,
            status=course.status,
            skills_taught=skills_taught_names,
            addresses_gaps=addresses_gap_names,
            gap_relevance_score=round(gap_relevance_score * 100, 1),
            reason=". ".join(reason_parts) if reason_parts else "Relevant training course"
        ))
    
    # Sort by relevance score
    recommended_courses.sort(key=lambda x: x.gap_relevance_score, reverse=True)
    
    return TrainingRecommendationsResponse(
        missing_skills=list(missing_skill_names.values()),
        recommended_courses=recommended_courses[:10],  # Top 10 recommendations
        total_gaps=len(all_missing_skills),
        courses_available=total_active_courses
    )