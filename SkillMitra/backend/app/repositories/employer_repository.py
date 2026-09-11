
import uuid
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from app.models.identity import Employer
from app.models.market import JobPosting
from app.models.phase4 import CandidateSkill
from app.models.identity import CandidateProfile
from app.models.market import JobPosting, JobPostingSkill


class EmployerRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_employer_by_user(self, user_id: uuid.UUID):
        return self.db.scalar(select(Employer).where(Employer.user_id == user_id))

    def create_job(self, employer_id: uuid.UUID, data: dict) -> JobPosting:
        job = JobPosting(employer_id=employer_id, **data)
        self.db.add(job)
        self.db.flush()
        return job

    def add_job_skill(self, job_id: uuid.UUID, data: dict) -> JobPostingSkill:
        skill = JobPostingSkill(job_posting_id=job_id, **data)
        self.db.add(skill)
        self.db.flush()
        return skill

    def remove_job_skill(self, job_id: uuid.UUID, skill_id: uuid.UUID) -> bool:
        stmt = select(JobPostingSkill).where(
            JobPostingSkill.job_posting_id == job_id,
            JobPostingSkill.skill_id == skill_id,
        )
        skill = self.db.scalar(stmt)
        if skill:
            self.db.delete(skill)
            self.db.flush()
            return True
        return False

    def get_matched_candidates(self, employer_id: uuid.UUID, district_id: uuid.UUID | None = None):
        """
        Get candidates matched to employer's job postings based on skill compatibility.
        Returns candidates with match scores calculated from skill overlap.
        """
        from app.models.skills import Skill, SkillProficiencyLevel
        from app.models.geography import District
        
        # Get employer's job postings with their required skills
        stmt = (
            select(JobPosting)
            .where(JobPosting.employer_id == employer_id)
            .where(JobPosting.status == "open")
            .options(selectinload(JobPosting.job_posting_skills))
        )
        if district_id:
            stmt = stmt.where(JobPosting.district_id == district_id)
        
        job_postings = self.db.scalars(stmt).all()
        
        if not job_postings:
            return []
        
        # Collect all required skills from employer's jobs
        required_skill_ids = set()
        for job in job_postings:
            for jps in job.job_posting_skills:
                required_skill_ids.add(jps.skill_id)
        
        if not required_skill_ids:
            return []
        
        # Get candidates who have at least one of the required skills
        candidate_skills_stmt = (
            select(CandidateSkill)
            .where(CandidateSkill.skill_id.in_(required_skill_ids))
            .options(selectinload(CandidateSkill.skill))
        )
        candidate_skills = self.db.scalars(candidate_skills_stmt).all()
        
        # Group skills by candidate
        candidate_skill_map = {}
        for cs in candidate_skills:
            if cs.candidate_id not in candidate_skill_map:
                candidate_skill_map[cs.candidate_id] = []
            candidate_skill_map[cs.candidate_id].append(cs)
        
        # Get candidate profiles
        candidate_ids = list(candidate_skill_map.keys())
        candidates_stmt = (
            select(CandidateProfile)
            .where(CandidateProfile.id.in_(candidate_ids))
            .options(selectinload(CandidateProfile.user))
        )
        if district_id:
            candidates_stmt = candidates_stmt.where(CandidateProfile.district_id == district_id)
        
        candidates = self.db.scalars(candidates_stmt).all()
        
        # Calculate match scores and build response
        matched_candidates = []
        for candidate in candidates:
            candidate_skills_list = candidate_skill_map.get(candidate.id, [])
            candidate_skill_ids = {cs.skill_id for cs in candidate_skills_list}
            
            # Calculate skill overlap
            matched_skills = required_skill_ids.intersection(candidate_skill_ids)
            match_percentage = len(matched_skills) / len(required_skill_ids) * 100 if required_skill_ids else 0
            
            # Get district name
            district_name = None
            if candidate.district_id:
                district = self.db.scalar(select(District).where(District.id == candidate.district_id))
                district_name = district.name if district else None
            
            # Determine status based on match percentage
            if match_percentage >= 70:
                status = "Job Ready"
            elif match_percentage >= 40:
                status = "Available"
            else:
                status = "Needs Training"
            
            # Get skill names
            skill_names = [cs.skill.name for cs in candidate_skills_list if cs.skill][:5]
            
            matched_candidates.append({
                "id": str(candidate.id),
                "name": candidate.user.full_name if candidate.user else "Unknown",
                "email": candidate.user.email if candidate.user else None,
                "location": district_name or "Not specified",
                "education_level": candidate.education_level or "Not specified",
                "skills": skill_names,
                "status": status,
                "match": round(match_percentage),
                "total_required_skills": len(required_skill_ids),
                "matched_skill_count": len(matched_skills)
            })
        
        # Sort by match percentage descending
        matched_candidates.sort(key=lambda x: x["match"], reverse=True)
        
        return matched_candidates
