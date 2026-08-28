
import uuid
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.repositories.course_repository import CourseRepository

class CourseService:
    def __init__(self, db: Session):
        self.repo = CourseRepository(db)

    def get_courses(self, skip: int, limit: int):
        return self.repo.get_courses(skip, limit)

    def get_course(self, course_id: uuid.UUID):
        course = self.repo.get_course_detail(course_id)
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        return course
