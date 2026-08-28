import uuid
from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.demand import DemandSignal
from app.repositories.employer_repository import EmployerRepository
from app.repositories.job_repository import JobRepository
from app.schemas.jobs import JobCreate, JobPostingSkillCreate

class EmployerService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = EmployerRepository(db)
        self.job_repo = JobRepository(db)

    def get_employer(self, user_id: uuid.UUID):
        emp = self.repo.get_employer_by_user(user_id)
        if not emp:
            raise HTTPException(status_code=404, detail="Employer profile not found")
        return emp

    def create_job(self, user_id: uuid.UUID, data: JobCreate):
        emp = self.get_employer(user_id)
        job = self.repo.create_job(emp.id, data.model_dump())
        self.db.commit()
        self.db.refresh(job)
        return job

    def add_job_skill(self, user_id: uuid.UUID, job_id: uuid.UUID, data: JobPostingSkillCreate):
        emp = self.get_employer(user_id)
        job = self.job_repo.get_job(job_id)
        if not job or job.employer_id != emp.id:
            raise HTTPException(status_code=403, detail="Not authorized to edit this job")

        skill = self.repo.add_job_skill(job.id, data.model_dump())
        # Feed the labour-market intelligence pipeline: every required skill on
        # an open job posting is a demand signal (source: job_posting).
        if job.status == "open":
            exists = self.db.scalar(
                select(DemandSignal.id).where(
                    DemandSignal.job_posting_id == job.id,
                    DemandSignal.skill_id == data.skill_id,
                )
            )
            if not exists:
                self.db.add(DemandSignal(
                    skill_id=data.skill_id,
                    job_role_id=job.job_role_id,
                    district_id=job.district_id,
                    job_posting_id=job.id,
                    raw_weight=1.0,
                    scaled_weight=1.0,
                    detected_at=datetime.now(timezone.utc),
                ))
        self.db.commit()
        return skill

    def remove_job_skill(self, user_id: uuid.UUID, job_id: uuid.UUID, skill_id: uuid.UUID):
        emp = self.get_employer(user_id)
        job = self.job_repo.get_job(job_id)
        if not job or job.employer_id != emp.id:
            raise HTTPException(status_code=403, detail="Not authorized to edit this job")
            
        if not self.repo.remove_job_skill(job.id, skill_id):
            raise HTTPException(status_code=404, detail="Skill not found on this job")
        self.db.commit()
