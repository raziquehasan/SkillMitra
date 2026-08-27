
import uuid
from sqlalchemy import select, func
from sqlalchemy.orm import Session, selectinload
from app.models.skills import Skill, SkillCategory, SkillProficiencyLevel

class SkillRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_skills(self, skip: int = 0, limit: int = 20, category_id: uuid.UUID = None):
        stmt = select(Skill).where(Skill.is_active == True).options(selectinload(Skill.category))
        if category_id:
            stmt = stmt.where(Skill.category_id == category_id)
        
        total = self.db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
        items = self.db.scalars(stmt.offset(skip).limit(limit)).all()
        return items, total

    def get_categories(self):
        return self.db.scalars(select(SkillCategory)).all()

    def get_proficiency_levels(self):
        return self.db.scalars(select(SkillProficiencyLevel).order_by(SkillProficiencyLevel.rank_score)).all()
