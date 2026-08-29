
import uuid
from sqlalchemy import select, func
from sqlalchemy.orm import Session, selectinload
from app.models.market import JobPosting, JobPostingSkill
from app.schemas.jobs import JobResponse


class JobRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_jobs(self, skip: int = 0, limit: int = 20, **filters):
        stmt = (
            select(JobPosting)
            .where(JobPosting.status == "open")
            .options(
                selectinload(JobPosting.employer),
                selectinload(JobPosting.job_posting_skills).selectinload(JobPostingSkill.skill),
            )
        )
        if filters.get("district_id"):
            stmt = stmt.where(JobPosting.district_id == filters["district_id"])
        if filters.get("job_role_id"):
            stmt = stmt.where(JobPosting.job_role_id == filters["job_role_id"])
        if filters.get("employer_id"):
            stmt = stmt.where(JobPosting.employer_id == filters["employer_id"])

        total = self.db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
        items = self.db.scalars(stmt.offset(skip).limit(limit)).all()
        return [JobResponse.from_orm_with_relations(item) for item in items], total

    def get_job(self, job_id: uuid.UUID):
        stmt = (
            select(JobPosting)
            .where(JobPosting.id == job_id)
            .options(
                selectinload(JobPosting.employer),
                selectinload(JobPosting.job_posting_skills).selectinload(JobPostingSkill.skill),
            )
        )
        job = self.db.scalar(stmt)
        return JobResponse.from_orm_with_relations(job) if job else None
