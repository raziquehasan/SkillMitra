
import uuid
from pydantic import BaseModel, ConfigDict


class EmployerResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    company_name: str
    is_verified: bool
    district_id: uuid.UUID | None = None
    industry_sector_id: uuid.UUID | None = None
    model_config = ConfigDict(from_attributes=True)
