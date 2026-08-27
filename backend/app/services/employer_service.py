
import uuid
from fastapi import HTTPException
from sqlalchemy.orm import Session
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
