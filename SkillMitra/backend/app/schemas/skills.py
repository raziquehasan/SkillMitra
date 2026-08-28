
import uuid
from pydantic import BaseModel, ConfigDict

class SkillProficiencyLevelResponse(BaseModel):
    id: uuid.UUID
    code: str | None = None
    name: str
    rank_score: int | None = None
    model_config = ConfigDict(from_attributes=True)

class SkillCategoryResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None = None
    model_config = ConfigDict(from_attributes=True)

class SkillResponse(BaseModel):
    id: uuid.UUID
    category_id: uuid.UUID
    name: str
    description: str | None = None
    is_active: bool
    category: SkillCategoryResponse | None = None
    model_config = ConfigDict(from_attributes=True)
