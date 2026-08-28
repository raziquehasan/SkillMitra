"""
ORM model registry for SkillMitra.

Import all model modules here so that:
1. Alembic env.py can import Base.metadata and see all tables.
2. Relationship resolution works across modules.

All model modules are imported here so Alembic sees the complete metadata.
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
from app.models.phase4 import (  # noqa: F401
    CandidateSkill,
    Curriculum,
    CurriculumVersion,
    CurriculumSkill,
    TrainingProvider,
    CourseOffering,
    Trainer,
    TrainerSkill,
    Equipment,
    CourseEquipmentRequirement,
    DistrictTrainingPlan,
    DistrictTrainingPlanItem,
)
from app.models.phase6 import (  # noqa: F401
    DataIngestionRun,
    RawJobPosting,
    IngestionRejectedRecord,
    JobRoleAlias,
    IndustryConsultation,
    EmployerCurriculumValidation,
)
from app.models.phase8 import (  # noqa: F401
    GovernmentOfficial,
    EmergingTechnology,
    TechnologySkill,
    CourseHealthScore,
)
from app.models.phase9 import (  # noqa: F401
    CurriculumProposal,
    AuditLog,
)
from app.models.staging import (  # noqa: F401
    SourceArtifact,
    RawStagingCourse,
    RawStagingProvider,
    RawStagingSkill,
    RawStagingJobRole,
    StagingCourse,
    StagingProvider,
    StagingSkill,
    StagingJobRole,
    PromotionAuditLog,
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
    "CandidateSkill",
    "Curriculum",
    "CurriculumVersion",
    "CurriculumSkill",
    "TrainingProvider",
    "CourseOffering",
    "Trainer",
    "TrainerSkill",
    "Equipment",
    "CourseEquipmentRequirement",
    "DistrictTrainingPlan",
    "DistrictTrainingPlanItem",
    "DataIngestionRun",
    "RawJobPosting",
    "IngestionRejectedRecord",
    "JobRoleAlias",
    "IndustryConsultation",
    "EmployerCurriculumValidation",
    "GovernmentOfficial",
    "EmergingTechnology",
    "TechnologySkill",
    "CourseHealthScore",
    "CurriculumProposal",
    "AuditLog",
    "SourceArtifact",
    "RawStagingCourse",
    "RawStagingProvider",
    "RawStagingSkill",
    "RawStagingJobRole",
    "StagingCourse",
    "StagingProvider",
    "StagingSkill",
    "StagingJobRole",
    "PromotionAuditLog",
]
