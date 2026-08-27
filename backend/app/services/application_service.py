
import uuid
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.repositories.application_repository import ApplicationRepository
from app.repositories.candidate_repository import CandidateRepository
from app.repositories.job_repository import JobRepository

class ApplicationService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ApplicationRepository(db)
        self.candidate_repo = CandidateRepository(db)
        self.job_repo = JobRepository(db)

    def apply_to_job(self, user_id: uuid.UUID, job_id: uuid.UUID):
        profile = self.candidate_repo.get_by_user_id(user_id)
        if not profile:
            raise HTTPException(status_code=404, detail="Candidate profile required to apply")
            
        job = self.job_repo.get_job(job_id)
        if not job or job.status != "OPEN":
            raise HTTPException(status_code=400, detail="Job is not open")
            
        try:
            app = self.repo.apply_to_job(profile.id, job.id)
            self.db.commit()
            self.db.refresh(app)
            return app
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(status_code=409, detail="Already applied to this job")
