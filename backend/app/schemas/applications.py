
import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ApplicationResponse(BaseModel):
    id: uuid.UUID
    job_posting_id: uuid.UUID
    candidate_id: uuid.UUID
    status: str
    applied_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)


class ApplicationCreate(BaseModel):
    job_posting_id: uuid.UUID
