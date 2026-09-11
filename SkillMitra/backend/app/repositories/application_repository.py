
import uuid
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload, joinedload
from app.models.market import Application

class ApplicationRepository:
    def __init__(self, db: Session):
        self.db = db

    def apply_to_job(self, candidate_id: uuid.UUID, job_id: uuid.UUID) -> Application:
        from datetime import datetime, timezone
        app = Application(
            candidate_id=candidate_id,
            job_posting_id=job_id,
            status="applied",
            applied_at=datetime.now(timezone.utc)
        )
        self.db.add(app)
        self.db.flush()
        return app

    def get_by_candidate_id(self, candidate_id: uuid.UUID):
        from app.models.market import JobPosting
        from sqlalchemy.orm import joinedload
        stmt = (
            select(Application)
            .where(Application.candidate_id == candidate_id)
            .options(
                selectinload(Application.job_posting).options(
                    joinedload(JobPosting.employer),
                    joinedload(JobPosting.district)
                )
            )
            .order_by(Application.applied_at.desc())
        )
        return self.db.execute(stmt).scalars().all()

    def get_by_candidate_and_job(self, candidate_id: uuid.UUID, job_id: uuid.UUID):
        stmt = (
            select(Application)
            .where(Application.candidate_id == candidate_id)
            .where(Application.job_posting_id == job_id)
        )
        return self.db.scalar(stmt)
