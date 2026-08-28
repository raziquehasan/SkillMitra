
import uuid
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.identity import Employer
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
