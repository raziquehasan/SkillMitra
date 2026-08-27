
import uuid
from sqlalchemy.orm import Session
from app.repositories.skill_repository import SkillRepository

class SkillService:
    def __init__(self, db: Session):
        self.repo = SkillRepository(db)

    def get_skills(self, skip: int, limit: int, category_id: uuid.UUID = None):
        return self.repo.get_skills(skip, limit, category_id)
        
    def get_categories(self):
        return self.repo.get_categories()
        
    def get_proficiency_levels(self):
        return self.repo.get_proficiency_levels()
