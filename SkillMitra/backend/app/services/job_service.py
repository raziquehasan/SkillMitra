
import uuid
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.repositories.job_repository import JobRepository
from app.repositories.employer_repository import EmployerRepository

class JobService:
    def __init__(self, db: Session):
        self.repo = JobRepository(db)
        self.emp_repo = EmployerRepository(db)

    def get_jobs(self, skip: int, limit: int, **filters):
        return self.repo.get_jobs(skip, limit, **filters)

    def get_job(self, job_id: uuid.UUID):
        job = self.repo.get_job(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        return job

    def get_related_courses(self, job_id: uuid.UUID):
        job = self.repo.get_job(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        return self.repo.get_related_courses(job_id)
