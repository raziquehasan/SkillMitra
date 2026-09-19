"""
Job recommendations based on candidate skills.
"""

import uuid
from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.orm import Session, selectinload
from app.core.database import get_db
from app.core.auth import require_roles
from app.models.identity import User, CandidateProfile
from app.models.phase4 import CandidateSkill
from app.models.market import JobPosting, JobPostingSkill
from app.models.career import JobRole
from app.models.skills import Skill
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/candidates/me/job-recommendations", tags=["Job Recommendations"])


class RecommendedJob(BaseModel):
    """Job recommendation with match information."""
    job_id: str
    title: str
    company_name: str
    location: str | None
    required_skills: list[str]
    matched_skills: list[str]
    missing_skills: list[str]
    match_percentage: float
    status: str
    posted_date: str | None
    reason: str


class JobRecommendationsResponse(BaseModel):
    """Response with recommended jobs based on skill matching."""
    recommended_jobs: list[RecommendedJob]
    total_jobs_analyzed: int
    high_match_jobs: int
    reason: str | None = None


@router.get("", response_model=JobRecommendationsResponse)
def get_job_recommendations(
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    """
    Get job recommendations based on candidate skills.
    
    Flow:
    1. Get candidate's confirmed skills
    2. Get all active job postings
    3. Calculate skill match for each job
    4. Rank jobs by match percentage
    """
    # Get candidate profile
    profile = db.scalar(
        select(CandidateProfile).where(CandidateProfile.user_id == current_user.id)
    )
    if not profile:
        return JobRecommendationsResponse(
            recommended_jobs=[],
            total_jobs_analyzed=0,
            high_match_jobs=0,
            reason="Candidate profile not found"
        )
    
    # Get candidate's current skills
    candidate_skills = db.scalars(
        select(CandidateSkill.skill_id).where(CandidateSkill.candidate_id == profile.id)
    ).all()
    candidate_skill_ids = set(candidate_skills)
    
    if not candidate_skill_ids:
        return JobRecommendationsResponse(
            recommended_jobs=[],
            total_jobs_analyzed=0,
            high_match_jobs=0,
            reason="Please add skills to your profile to get job recommendations"
        )
    
    # Get skill names for candidate skills
    candidate_skill_objs = db.scalars(
        select(Skill).where(Skill.id.in_(candidate_skill_ids))
    ).all()
    candidate_skill_names = {skill.id: skill.name for skill in candidate_skill_objs}
    
    # Get all active job postings with their required skills, employer, and district
    job_postings = db.scalars(
        select(JobPosting)
        .where(JobPosting.status == 'open')
        .options(
            selectinload(JobPosting.job_posting_skills),
            selectinload(JobPosting.employer),
            selectinload(JobPosting.district),
        )
    ).all()
    
    if not job_postings:
        return JobRecommendationsResponse(
            recommended_jobs=[],
            total_jobs_analyzed=0,
            high_match_jobs=0,
            reason="No active job postings available"
        )
    
    # Calculate match for each job
    recommended_jobs = []
    high_match_count = 0
    
    for job in job_postings:
        # Get required skills for this job
        required_skill_ids = set()
        for jps in job.job_posting_skills:
            required_skill_ids.add(jps.skill_id)
        
        if not required_skill_ids:
            continue  # Skip jobs with no required skills
        
        # Calculate match
        matched_skills = candidate_skill_ids & required_skill_ids
        missing_skills = required_skill_ids - candidate_skill_ids
        
        match_percentage = len(matched_skills) / len(required_skill_ids) if required_skill_ids else 0
        
        # Only include jobs with at least some match
        if match_percentage > 0:
            # Get skill names
            matched_skill_names = [
                candidate_skill_names.get(skill_id, "Unknown Skill")
                for skill_id in matched_skills
            ]
            
            missing_skill_names = []
            for skill_id in missing_skills:
                skill = db.scalar(select(Skill).where(Skill.id == skill_id))
                if skill:
                    missing_skill_names.append(skill.name)
            
            required_skill_names = []
            for skill_id in required_skill_ids:
                skill = db.scalar(select(Skill).where(Skill.id == skill_id))
                if skill:
                    required_skill_names.append(skill.name)
            
            # Build reason
            reason_parts = []
            if match_percentage >= 0.7:
                reason_parts.append("High skill match")
                high_match_count += 1
            elif match_percentage >= 0.5:
                reason_parts.append("Good skill match")
            else:
                reason_parts.append("Partial skill match")
            
            if len(missing_skill_names) <= 2:
                reason_parts.append("Only a few additional skills needed")
            
            recommended_jobs.append(RecommendedJob(
                job_id=str(job.id),
                title=job.title,
                company_name=job.employer.company_name if job.employer else "Unknown",
                location=job.district.name if job.district else None,
                required_skills=required_skill_names,
                matched_skills=matched_skill_names,
                missing_skills=missing_skill_names,
                match_percentage=round(match_percentage * 100, 1),
                status=job.status,
                posted_date=job.posted_date.isoformat() if job.posted_date else None,
                reason=". ".join(reason_parts) if reason_parts else "Matches your skills"
            ))
    
    # Sort by match percentage
    recommended_jobs.sort(key=lambda x: x.match_percentage, reverse=True)
    
    return JobRecommendationsResponse(
        recommended_jobs=recommended_jobs[:20],  # Top 20 recommendations
        total_jobs_analyzed=len(job_postings),
        high_match_jobs=high_match_count
    )