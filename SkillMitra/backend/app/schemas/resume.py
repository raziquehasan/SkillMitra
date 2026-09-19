"""
Pydantic schemas for resume upload and processing.
"""

import uuid
from datetime import datetime
from pydantic import BaseModel, field_validator


class ResumeUploadResponse(BaseModel):
    """Response after successful resume upload."""
    id: uuid.UUID
    candidate_id: uuid.UUID
    file_name: str
    file_type: str
    file_size: int
    processing_status: str
    uploaded_at: datetime
    message: str = "Resume uploaded successfully. Processing started."


class ResumeProcessingResponse(BaseModel):
    """Response after resume processing."""
    resume_id: uuid.UUID
    processing_status: str
    extracted_skills: list[dict] = []
    extracted_education: list[dict] = []
    extracted_experience: list[dict] = []
    processing_error: str | None = None
    message: str


class SkillExtractionResult(BaseModel):
    """Result of skill extraction from resume."""
    skill_id: uuid.UUID
    skill_name: str
    confidence: str  # "high", "medium", "low"
    category: str  # "technical", "soft", "certification"
    source_context: str | None = None


class ResumeReviewData(BaseModel):
    """Data for candidate to review extracted information."""
    resume_id: uuid.UUID
    extracted_skills: list[SkillExtractionResult]
    extracted_education: list[dict]
    extracted_experience: list[dict]
    candidate_id: uuid.UUID


class SkillConfirmationRequest(BaseModel):
    """Request to confirm/reject extracted skills."""
    resume_id: uuid.UUID
    confirmed_skills: list[uuid.UUID]  # skill_ids to keep
    rejected_skills: list[uuid.UUID]   # skill_ids to remove
    additional_skills: list[dict] = [] # manually added skills

    @field_validator('confirmed_skills', 'rejected_skills', mode='before')
    @classmethod
    def filter_null_uuids(cls, v: list) -> list:
        """Strip null/None/empty values before UUID validation."""
        if not isinstance(v, list):
            return v
        return [item for item in v if item is not None and item != '' and item != 'null']


class SkillConfirmationResponse(BaseModel):
    """Response after skill confirmation."""
    message: str
    confirmed_count: int
    rejected_count: int
    added_count: int
    total_skills: int