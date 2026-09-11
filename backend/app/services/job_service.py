
import uuid
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.repositories.job_repository import JobRepository
from app.repositories.employer_repository import EmployerRepository
from app.schemas.jobs import JobResponse

class JobService:
    def __init__(self, db: Session):
        self.repo = JobRepository(db)
        self.emp_repo = EmployerRepository(db)

    def get_jobs(self, skip: int, limit: int, **filters):
        items, total = self.repo.get_jobs(skip, limit, **filters)
        
        # Enrich with additional fields for API response
        enriched_items = []
        for item in items:
            skills = [jps.skill.name for jps in item.job_posting_skills if jps.skill]
            enriched_items.append(JobResponse(
                id=item.id,
                employer_id=item.employer_id,
                job_role_id=item.job_role_id,
                district_id=item.district_id,
                title=item.title,
                status=item.status,
                posted_date=item.posted_date,
                company_name=item.employer.company_name if item.employer else None,
                district_name=item.district.name if item.district else None,
                job_role_title=item.job_role.title if item.job_role else None,
                skills=skills,
                employer_website=item.employer.website if item.employer else None,
                job_url=getattr(item, 'job_url', None),
                employer_careers_url=getattr(item, 'employer_careers_url', None),
                is_verified=item.employer.is_verified if item.employer else False
            ))
        
        return enriched_items, total

    def get_job(self, job_id: uuid.UUID):
        job = self.repo.get_job(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        return job
