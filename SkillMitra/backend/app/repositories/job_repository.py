
import uuid
from sqlalchemy import select, func, or_
from sqlalchemy.orm import Session, selectinload
from app.models.market import JobPosting, JobPostingSkill
from app.models.identity import Employer
from app.models.skills import Skill
from app.schemas.jobs import JobResponse


class JobRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_jobs(self, skip: int = 0, limit: int = 20, **filters):
        stmt = (
            select(JobPosting)
            .where(JobPosting.status == "open")
            .options(
                selectinload(JobPosting.employer),
                selectinload(JobPosting.job_role),
                selectinload(JobPosting.district),
                selectinload(JobPosting.job_posting_skills).selectinload(JobPostingSkill.skill),
            )
        )
        if filters.get("district_id"):
            stmt = stmt.where(JobPosting.district_id == filters["district_id"])
        if filters.get("job_role_id"):
            stmt = stmt.where(JobPosting.job_role_id == filters["job_role_id"])
        if filters.get("employer_id"):
            stmt = stmt.where(JobPosting.employer_id == filters["employer_id"])
        if filters.get("search"):
            search_term = f"%{filters['search']}%"
            stmt = stmt.where(
                (JobPosting.title.ilike(search_term)) |
                (JobPosting.employer.has(Employer.company_name.ilike(search_term)))
            )

        total = self.db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
        items = self.db.scalars(stmt.offset(skip).limit(limit)).all()
        return [JobResponse.from_orm_with_relations(item) for item in items], total

    def get_job(self, job_id: uuid.UUID):
        stmt = (
            select(JobPosting)
            .where(JobPosting.id == job_id)
            .options(
                selectinload(JobPosting.employer),
                selectinload(JobPosting.job_role),
                selectinload(JobPosting.district),
                selectinload(JobPosting.job_posting_skills).selectinload(JobPostingSkill.skill),
            )
        )
        job = self.db.scalar(stmt)
        return JobResponse.from_orm_with_relations(job) if job else None

    def get_related_courses(self, job_id: uuid.UUID):
        from app.models.career import Course, CourseSkill
        
        # Get the job posting with its skills
        job_stmt = (
            select(JobPosting)
            .where(JobPosting.id == job_id)
            .options(
                selectinload(JobPosting.job_posting_skills).selectinload(JobPostingSkill.skill),
            )
        )
        job = self.db.scalar(job_stmt)
        if not job:
            return []
        
        # Extract required skill IDs
        required_skill_ids = [jps.skill_id for jps in job.job_posting_skills if jps.skill]
        if not required_skill_ids:
            return []
        
        # Find courses that cover these skills
        course_stmt = (
            select(Course)
            .where(Course.status == "active")
            .options(
                selectinload(Course.course_skills).selectinload(CourseSkill.skill),
                selectinload(Course.district),
            )
        )
        
        courses = self.db.scalars(course_stmt).all()
        
        # Calculate relevance score for each course
        related_courses = []
        for course in courses:
            course_skill_ids = [cs.skill_id for cs in course.course_skills if cs.skill]
            
            # Calculate skill overlap
            mandatory_skills = set([
                jps.skill_id for jps in job.job_posting_skills 
                if jps.skill and jps.importance == "mandatory"
            ])
            preferred_skills = set([
                jps.skill_id for jps in job.job_posting_skills 
                if jps.skill and jps.importance == "preferred"
            ])
            
            covered_mandatory = len(mandatory_skills & set(course_skill_ids))
            covered_preferred = len(preferred_skills & set(course_skill_ids))
            
            # Only include courses that cover at least one mandatory skill
            if covered_mandatory > 0:
                total_mandatory = len(mandatory_skills) if mandatory_skills else 1
                total_preferred = len(preferred_skills) if preferred_skills else 1
                
                relevance_score = (
                    (covered_mandatory / total_mandatory) * 0.7 +
                    (covered_preferred / total_preferred) * 0.3
                )
                
                related_courses.append({
                    "course_id": str(course.id),
                    "title": course.title,
                    "description": course.description,
                    "district_id": str(course.district_id) if course.district_id else None,
                    "district_name": course.district.name if course.district else None,
                    "duration_hours": course.duration_hours,
                    "delivery_mode": course.delivery_mode,
                    "qualification": course.qualification,
                    "nsqf_level": course.nsqf_level,
                    "skills_covered": [cs.skill.name for cs in course.course_skills if cs.skill],
                    "covered_mandatory_skills": covered_mandatory,
                    "total_mandatory_skills": total_mandatory,
                    "covered_preferred_skills": covered_preferred,
                    "total_preferred_skills": total_preferred,
                    "relevance_score": relevance_score,
                })
        
        # Sort by relevance score
        related_courses.sort(key=lambda x: x["relevance_score"], reverse=True)
        
        return related_courses[:10]  # Return top 10 most relevant courses
