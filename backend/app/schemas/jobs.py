
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
    # Must satisfy ck_job_posting_skills_importance:
    # ('mandatory', 'preferred', 'nice_to_have')
    importance: str = "mandatory"


class JobResponse(BaseModel):
    id: uuid.UUID
    employer_id: uuid.UUID
    job_role_id: uuid.UUID
    district_id: uuid.UUID | None = None
    title: str
    status: str
    posted_date: date | None = None
    company_name: str | None = None
    district_name: str | None = None
    job_role_title: str | None = None
    skills: list[str] = []
    employer_website: str | None = None
    job_url: str | None = None
    employer_careers_url: str | None = None
    is_verified: bool = False
    model_config = ConfigDict(from_attributes=True)


class JobDetailResponse(JobResponse):
    job_posting_skills: list[JobPostingSkillResponse] = []


class JobCreate(BaseModel):
    job_role_id: uuid.UUID
    title: str
    district_id: uuid.UUID
    # Canonical lowercase status; JobRepository filters on status == "open".
    status: str = "open"
