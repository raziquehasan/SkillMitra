"""
ORM model registry for SkillMitra.

Import all model modules here so that:
1. Alembic env.py can import Base.metadata and see all tables.
2. Relationship resolution works across modules.

Only Phase 2A models are imported here.
Future phases will add imports as new model files are created.
"""

from app.models.base import Base, TimestampMixin  # noqa: F401

# Phase 2A models — import ORDER matters for FK resolution
from app.models.geography import State, District          # noqa: F401
from app.models.skills import (                           # noqa: F401
    SkillProficiencyLevel,
    SkillCategory,
    Skill,
    SkillAlias,
)
from app.models.identity import (                         # noqa: F401
    User,
    CandidateProfile,
    CandidateEducationHistory,
    CandidateCareerInterest,
    Employer,
)
from app.models.career import (                           # noqa: F401
    JobRole,
    JobRoleSkill,
    Course,
    CourseSkill,
    CourseEnrollment,
)
from app.models.market import (
    JobPosting,
    JobPostingSkill,
    Application,
    Placement,
)
from app.models.auth import (
    Role,
    UserRole,
    RefreshToken,
)
from app.models.demand import (
    IndustrySector,
    DataSource,
    EmployerSurvey,
    EmployerSurveyResponse,
    DemandSignal,
    IndustryDemand,
)

__all__ = [
    "Base",
    "TimestampMixin",
    "State",
    "District",
    "SkillProficiencyLevel",
    "SkillCategory",
    "Skill",
    "SkillAlias",
    "User",
    "CandidateProfile",
    "CandidateEducationHistory",
    "CandidateCareerInterest",
    "JobRole",
    "JobRoleSkill",
    "Course",
    "CourseSkill",
    "CourseEnrollment",
    "Employer",
    "JobPosting",
    "JobPostingSkill",
    "Application",
    "Placement",
    "IndustrySector",
    "DataSource",
    "EmployerSurvey",
    "EmployerSurveyResponse",
    "DemandSignal",
    "IndustryDemand",
    "Role",
    "UserRole",
    "RefreshToken",
]
