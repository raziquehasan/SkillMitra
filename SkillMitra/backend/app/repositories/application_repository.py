
import uuid
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.market import Application

class ApplicationRepository:
    def __init__(self, db: Session):
        self.db = db

    def apply_to_job(self, candidate_id: uuid.UUID, job_id: uuid.UUID) -> Application:
        app = Application(candidate_id=candidate_id, job_posting_id=job_id, status="APPLIED")
        self.db.add(app)
        self.db.flush()
        return app
