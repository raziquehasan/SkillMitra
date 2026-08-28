
import uuid
from datetime import date
from pydantic import BaseModel, ConfigDict


class CandidateEducationBase(BaseModel):
    institution_name: str
    education_level: str
    stream_specialization: str | None = None
    board_university: str | None = None
    passing_year: int | None = None
    marks_percentage: float | None = None


class CandidateEducationCreate(CandidateEducationBase):
    pass


class CandidateEducationUpdate(BaseModel):
    institution_name: str | None = None
    education_level: str | None = None
    stream_specialization: str | None = None
    board_university: str | None = None
    passing_year: int | None = None
    marks_percentage: float | None = None


class CandidateEducationResponse(CandidateEducationBase):
    id: uuid.UUID
    candidate_id: uuid.UUID
    model_config = ConfigDict(from_attributes=True)


class CandidateInterestBase(BaseModel):
    target_job_role_id: uuid.UUID
    preference_rank: int | None = None
    notes: str | None = None


class CandidateInterestCreate(CandidateInterestBase):
    pass


class CandidateInterestResponse(CandidateInterestBase):
    id: uuid.UUID
    candidate_id: uuid.UUID
    model_config = ConfigDict(from_attributes=True)


class CandidateProfileBase(BaseModel):
    district_id: uuid.UUID | None = None
    date_of_birth: date | None = None
    education_level: str | None = None
    current_status: str | None = None


class CandidateProfileUpdate(CandidateProfileBase):
    pass


class CandidateProfileResponse(CandidateProfileBase):
    id: uuid.UUID
    user_id: uuid.UUID
    education_history: list[CandidateEducationResponse] = []
    career_interests: list[CandidateInterestResponse] = []
    model_config = ConfigDict(from_attributes=True)


class CandidateSkillCreate(BaseModel):
    skill_id: uuid.UUID
    proficiency_level_id: uuid.UUID
    source: str = "candidate_claim"
    verification_status: str = "unverified"
    last_assessed_date: date | None = None
    evidence_reference: str | None = None


class CandidateSkillUpdate(BaseModel):
    proficiency_level_id: uuid.UUID | None = None
    source: str | None = None
    verification_status: str | None = None
    last_assessed_date: date | None = None
    evidence_reference: str | None = None


class CandidateSkillResponse(CandidateSkillCreate):
    id: uuid.UUID
    candidate_id: uuid.UUID
    model_config = ConfigDict(from_attributes=True)


class SkillGapItem(BaseModel):
    skill_id: str
    required_proficiency: str | None = None
    candidate_proficiency: str | None = None
    importance: str | None = None


class SkillGapResponse(BaseModel):
    job_role_id: uuid.UUID
    job_role_title: str
    matched_skill_ids: list[str]
    missing_skill_ids: list[str]
    proficiency_gaps: list[SkillGapItem]
