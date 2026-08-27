
import uuid
from datetime import date
from pydantic import BaseModel, ConfigDict
from app.schemas.skills import SkillResponse


class JobPostingSkillResponse(BaseModel):
    skill_id: uuid.UUID
    proficiency_level_id: uuid.UUID | None = None
    importance: str | None = None
    skill: SkillResponse | None = None
    model_config = ConfigDict(from_attributes=True)


class JobPostingSkillCreate(BaseModel):
    skill_id: uuid.UUID
    proficiency_level_id: uuid.UUID
    importance: str = "REQUIRED"


class JobResponse(BaseModel):
    id: uuid.UUID
    employer_id: uuid.UUID
    job_role_id: uuid.UUID
    district_id: uuid.UUID | None = None
    title: str
    status: str
    posted_date: date | None = None
    model_config = ConfigDict(from_attributes=True)


class JobDetailResponse(JobResponse):
    job_posting_skills: list[JobPostingSkillResponse] = []


class JobCreate(BaseModel):
    job_role_id: uuid.UUID
    title: str
    district_id: uuid.UUID
    status: str = "DRAFT"
