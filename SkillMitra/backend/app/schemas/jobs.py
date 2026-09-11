
import uuid
from datetime import date
from pydantic import BaseModel, ConfigDict
from app.schemas.skills import SkillResponse, SkillCategoryResponse


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
    employer_name: str | None = None
    company_name: str | None = None
    job_role_id: uuid.UUID
    job_role_title: str | None = None
    district_id: uuid.UUID | None = None
    district_name: str | None = None
    title: str
    status: str
    posted_date: date | None = None
    job_url: str | None = None
    employer_careers_url: str | None = None
    employer_website: str | None = None
    skills: list[str] = []
    job_posting_skills: list[JobPostingSkillResponse] = []
    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_orm_with_relations(cls, job_posting):
        data = {
            "id": job_posting.id,
            "employer_id": job_posting.employer_id,
            "employer_name": job_posting.employer.company_name if job_posting.employer else None,
            "company_name": job_posting.employer.company_name if job_posting.employer else None,
            "job_role_id": job_posting.job_role_id,
            "job_role_title": job_posting.job_role.title if job_posting.job_role else None,
            "district_id": job_posting.district_id,
            "district_name": job_posting.district.name if job_posting.district else None,
            "title": job_posting.title,
            "status": job_posting.status,
            "posted_date": job_posting.posted_date,
            "job_url": job_posting.job_url,
            "employer_careers_url": job_posting.employer_careers_url,
            "employer_website": job_posting.employer.website if job_posting.employer else None,
            "skills": [s.skill.name for s in job_posting.job_posting_skills if s.skill],
            "job_posting_skills": [
                JobPostingSkillResponse(
                    skill_id=s.skill_id,
                    proficiency_level_id=s.proficiency_level_id,
                    importance=s.importance,
                    skill=SkillResponse(
                        id=s.skill.id,
                        category_id=s.skill.category_id,
                        name=s.skill.name,
                        description=s.skill.description,
                        is_active=s.skill.is_active,
                        category=SkillCategoryResponse(
                            id=s.skill.category.id,
                            name=s.skill.category.name,
                            description=s.skill.category.description,
                        ) if s.skill.category else None,
                    ) if s.skill else None,
                )
                for s in job_posting.job_posting_skills
            ],
        }
        return cls(**data)


class JobDetailResponse(JobResponse):
    job_posting_skills: list[JobPostingSkillResponse] = []


class JobCreate(BaseModel):
    job_role_id: uuid.UUID
    title: str
    district_id: uuid.UUID
    # Canonical lowercase status; JobRepository filters on status == "open".
    status: str = "open"
    job_url: str | None = None
    employer_careers_url: str | None = None
