"""
Pydantic schemas for authentication + registration endpoints.
"""

import uuid
from datetime import date, datetime

from pydantic import BaseModel, EmailStr, field_validator


# ── Request schemas ───────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Password must not be empty.")
        return v


# ── Response schemas ──────────────────────────────────────────────────────
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class UserPublic(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str
    is_active: bool
    roles: list[str]

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    user: UserPublic
    access_token: str
    token_type: str = "bearer"
    expires_in: int


# ── Registration schemas ─────────────────────────────────────────────────
# One common registration entry point; role selects the role-specific form.
# Government officials self-register but land in PENDING_VERIFICATION and
# receive NO dashboard role until an admin approves them.

class CandidateRegistrationRequest(BaseModel):
    role: str = "candidate"
    # common identity
    full_name: str
    email: EmailStr
    phone: str | None = None
    password: str
    # candidate-specific
    gender: str | None = None
    date_of_birth: date | None = None
    district_id: uuid.UUID | None = None
    education_level: str | None = None
    stream_specialization: str | None = None

    @field_validator("password")
    @classmethod
    def password_min(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        return v


class EmployerRegistrationRequest(BaseModel):
    role: str = "employer"
    # common identity
    full_name: str
    email: EmailStr
    phone: str | None = None
    password: str
    # employer-specific
    company_name: str
    contact_person: str | None = None
    industry_sector_id: uuid.UUID
    district_id: uuid.UUID | None = None
    organization_type: str | None = None
    website: str | None = None
    size_category: str | None = None

    @field_validator("password")
    @classmethod
    def password_min(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        return v


class TrainingProviderRegistrationRequest(BaseModel):
    role: str = "training_provider"
    # common identity
    full_name: str
    email: EmailStr
    phone: str | None = None
    password: str
    # provider-specific
    institute_name: str
    provider_type: str | None = None
    district_id: uuid.UUID
    registration_number: str | None = None

    @field_validator("password")
    @classmethod
    def password_min(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        return v


class GovernmentOfficialRegistrationRequest(BaseModel):
    role: str = "government_official"
    # common identity
    full_name: str
    email: EmailStr
    phone: str | None = None
    password: str
    # official-specific
    department: str
    designation: str
    district_id: uuid.UUID | None = None
    employee_code: str | None = None

    @field_validator("password")
    @classmethod
    def password_min(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        return v


class RegistrationResponse(BaseModel):
    """Returned after successful registration (no tokens issued)."""
    user: UserPublic
    message: str
    verification_status: str | None = None  # only for government officials


class GovernmentOfficialReviewRequest(BaseModel):
    decision: str  # 'approved' | 'rejected'
    review_notes: str | None = None

    @field_validator("decision")
    @classmethod
    def decision_valid(cls, v: str) -> str:
        if v not in ("approved", "rejected"):
            raise ValueError("decision must be 'approved' or 'rejected'.")
        return v


class GovernmentOfficialOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    district_id: uuid.UUID | None = None
    department: str
    designation: str
    employee_code: str | None = None
    verification_status: str
    review_notes: str | None = None
    model_config = {"from_attributes": True}
