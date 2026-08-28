
import uuid
from sqlalchemy import select, func
from sqlalchemy.orm import Session, selectinload
from app.models.career import Course, CourseSkill


class CourseRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_courses(self, skip: int = 0, limit: int = 20):
        stmt = select(Course)
        total = self.db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
        items = self.db.scalars(stmt.offset(skip).limit(limit)).all()
        return items, total

    def get_course_detail(self, course_id: uuid.UUID):
        stmt = (
            select(Course)
            .where(Course.id == course_id)
            .options(selectinload(Course.course_skills).selectinload(CourseSkill.skill))
        )
        return self.db.scalar(stmt)
