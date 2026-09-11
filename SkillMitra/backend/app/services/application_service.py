
import uuid
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.repositories.application_repository import ApplicationRepository
from app.repositories.candidate_repository import CandidateRepository
from app.repositories.job_repository import JobRepository
from app.schemas.applications import ApplicationResponse

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
        if not job or job.status != "open":
            raise HTTPException(status_code=400, detail="Job is not open")
        
        # Check for duplicate application
        existing_app = self.repo.get_by_candidate_and_job(profile.id, job.id)
        if existing_app:
            raise HTTPException(status_code=409, detail="Already applied to this job")
            
        try:
            app = self.repo.apply_to_job(profile.id, job.id)
            self.db.commit()
            self.db.refresh(app)
            return app
        except IntegrityError as e:
            self.db.rollback()
            # Log the actual error for debugging
            print(f"IntegrityError during application: {str(e)}")
            # Only return 409 if it's actually a duplicate (unique constraint violation)
            # For other integrity errors, return a more specific error
            if "duplicate" in str(e).lower() or "unique" in str(e).lower():
                raise HTTPException(status_code=409, detail="Already applied to this job")
            else:
                raise HTTPException(status_code=500, detail="Database error during application. Please try again.")

    def get_my_applications(self, user_id: uuid.UUID):
        profile = self.candidate_repo.get_by_user_id(user_id)
        if not profile:
            return []
        
        applications = self.repo.get_by_candidate_id(profile.id)
        
        # Enrich with job details for frontend display
        result = []
        for app in applications:
            job_posting = app.job_posting
            app_dict = ApplicationResponse.model_validate(app).model_dump()
            if job_posting:
                app_dict['job_title'] = job_posting.title
                app_dict['job_company_name'] = job_posting.employer.company_name if job_posting.employer else None
                app_dict['job_district_name'] = job_posting.district.name if job_posting.district else None
                app_dict['job_posted_date'] = job_posting.posted_date.isoformat() if job_posting.posted_date else None
            result.append(ApplicationResponse(**app_dict))
        
        return result
