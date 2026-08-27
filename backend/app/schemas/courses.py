
import uuid
from pydantic import BaseModel, ConfigDict
from app.schemas.skills import SkillResponse


class CourseResponse(BaseModel):
    id: uuid.UUID
    district_id: uuid.UUID | None = None
    title: str
    description: str | None = None
    duration_hours: int | None = None
    status: str | None = None
    delivery_mode: str | None = None
    model_config = ConfigDict(from_attributes=True)


class CourseSkillResponse(BaseModel):
    skill_id: uuid.UUID
    proficiency_level_id: uuid.UUID | None = None
    is_primary: bool | None = None
    skill: SkillResponse | None = None
    model_config = ConfigDict(from_attributes=True)


class CourseDetailResponse(CourseResponse):
    course_skills: list[CourseSkillResponse] = []
