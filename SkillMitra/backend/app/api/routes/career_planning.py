"""Career Planning API - district and sector-based career intelligence."""
import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import text, select, or_
from app.core.database import get_db
from app.models.market import JobPosting
from app.models.career import JobRole
from pydantic import BaseModel, ConfigDict

router = APIRouter(prefix="/api/v1/career-planning", tags=["Career Planning"])


class CareerPlanOut(BaseModel):
    id: str
    district_id: str | None
    district_name: str
    sector: str
    priority_skills: list[str]
    pg_training: list[str]
    job_roles: list[str]
    created_at: str
    related_courses: list[dict] = []
    related_jobs: list[dict] = []


class CareerPlanningResponse(BaseModel):
    district: str | None
    plans: list[CareerPlanOut]


def find_related_courses(db: Session, priority_skills: list[str], district_id: str | None = None) -> list[dict]:
    """
    Find courses that match the priority skills.
    Returns only courses with actual skill-to-course mappings.
    """
    if not priority_skills:
        return []
    
    from app.models.career import Course, CourseSkill
    from app.models.skills import Skill
    from sqlalchemy.orm import selectinload
    from sqlalchemy import or_
    
    # Get all skills that match any of the priority skills (case-insensitive partial match)
    skill_conditions = [Skill.name.ilike(f'%{skill}%') for skill in priority_skills[:3]]  # Limit to first 3 skills for performance
    skill_matches = db.execute(
        select(Skill.id, Skill.name)
        .where(or_(*skill_conditions))
    ).fetchall()
    
    if not skill_matches:
        return []
    
    skill_ids = [skill[0] for skill in skill_matches]
    
    # Find courses that have these skills
    courses_query = (
        select(Course)
        .join(CourseSkill, Course.id == CourseSkill.course_id)
        .where(CourseSkill.skill_id.in_(skill_ids))
        .where(Course.status == 'active')
        .options(selectinload(Course.course_skills))
        .distinct()
        .limit(5)
    )
    
    if district_id:
        try:
            courses_query = courses_query.where(Course.district_id == uuid.UUID(district_id))
        except ValueError:
            pass  # Invalid UUID, skip district filter
    
    courses = db.execute(courses_query).scalars().all()
    
    related_courses = []
    for course in courses:
        # Get the skill names for this course
        course_skill_names = []
        for cs in course.course_skills:
            if cs.skill:
                course_skill_names.append(cs.skill.name)
        
        related_courses.append({
            "id": str(course.id),
            "title": course.title,
            "description": course.description,
            "district_id": str(course.district_id) if course.district_id else None,
            "status": course.status,
            "skills_covered": course_skill_names
        })
    
    return related_courses


def find_related_jobs(db: Session, job_roles: list[str], district_id: str | None = None) -> list[dict]:
    """
    Find job postings that match the career planning job roles.
    Returns only jobs with actual role-to-job mappings.
    """
    if not job_roles:
        return []
    
    from app.models.market import JobPosting
    from app.models.career import JobRole
    from sqlalchemy import or_
    
    # Get job roles that match the career planning roles (case-insensitive partial match)
    role_conditions = [JobRole.title.ilike(f'%{role}%') for role in job_roles[:3]]  # Limit to first 3 roles for performance
    role_matches = db.execute(
        select(JobRole.id, JobRole.title)
        .where(or_(*role_conditions))
    ).fetchall()
    
    if not role_matches:
        return []
    
    role_ids = [role[0] for role in role_matches]
    
    # Find job postings that have these roles (eager-load employer to avoid lazy-load errors)
    jobs_query = (
        select(JobPosting)
        .where(JobPosting.job_role_id.in_(role_ids))
        .where(JobPosting.status == 'active')
        .options(selectinload(JobPosting.employer))
        .distinct()
        .limit(5)
    )
    
    if district_id:
        try:
            jobs_query = jobs_query.where(JobPosting.district_id == uuid.UUID(district_id))
        except ValueError:
            pass  # Invalid UUID, skip district filter
    
    jobs = db.execute(jobs_query).scalars().all()
    
    related_jobs = []
    for job in jobs:
        related_jobs.append({
            "id": str(job.id),
            "title": job.title,
            "company_name": job.employer.company_name if job.employer else "Unknown",
            "district_id": str(job.district_id) if job.district_id else None,
            "status": job.status,
            "posted_date": job.posted_date.isoformat() if job.posted_date else None
        })
    
    return related_jobs


@router.get("", response_model=CareerPlanningResponse)
def get_career_planning(
    district_id: uuid.UUID | None = Query(None),
    sector: str | None = Query(None),
    db: Session = Depends(get_db),
):
    """Get career planning data for districts and sectors."""
    
    # Build query parameters
    conditions = []
    params = {}
    
    if district_id:
        conditions.append("district_id = :district_id")
        params['district_id'] = str(district_id)
    
    if sector:
        conditions.append("sector = :sector")
        params['sector'] = sector
    
    where_clause = " AND ".join(conditions) if conditions else "1=1"
    
    query = text(f"""
        SELECT id, district_id, district_name, sector, priority_skills, pg_training, job_roles, created_at
        FROM career_plans
        WHERE {where_clause}
        ORDER BY district_name, sector
    """)
    
    result = db.execute(query, params).fetchall()
    
    # Convert database rows to structured response
    plans = []
    district_name = None
    
    for row in result:
        # Convert row to dictionary for easier access
        row_dict = {
            'id': row[0],
            'district_id': row[1], 
            'district_name': row[2], 
            'sector': row[3], 
            'priority_skills': row[4], 
            'pg_training': row[5], 
            'job_roles': row[6], 
            'created_at': row[7]
        }
        
        district_name = row_dict['district_name']
        
        # Parse comma/semicolon separated fields into arrays
        priority_skills = [skill.strip() for skill in row_dict['priority_skills'].split(';') if skill.strip()] if row_dict['priority_skills'] else []
        pg_training = [training.strip() for training in row_dict['pg_training'].split(';') if training.strip()] if row_dict['pg_training'] else []
        job_roles = [role.strip() for role in row_dict['job_roles'].split(';') if role.strip()] if row_dict['job_roles'] else []
        
        # Find related courses based on priority skills
        related_courses = find_related_courses(db, priority_skills, str(row_dict['district_id']) if row_dict['district_id'] else None)
        
        # Find related jobs based on job roles
        related_jobs = find_related_jobs(db, job_roles, str(row_dict['district_id']) if row_dict['district_id'] else None)
        
        plans.append(CareerPlanOut(
            id=str(row_dict['id']),
            district_id=str(row_dict['district_id']) if row_dict['district_id'] else None,
            district_name=row_dict['district_name'],
            sector=row_dict['sector'],
            priority_skills=priority_skills,
            pg_training=pg_training,
            job_roles=job_roles,
            created_at=row_dict['created_at'].isoformat() if row_dict['created_at'] else None,
            related_courses=related_courses,
            related_jobs=related_jobs
        ))
    
    return CareerPlanningResponse(
        district=district_name,
        plans=plans
    )


@router.get("/districts", response_model=list[dict])
def get_career_planning_districts(db: Session = Depends(get_db)):
    """Get all districts that have career planning data."""
    
    result = db.execute(text("""
        SELECT DISTINCT district_id, district_name, COUNT(*) as plan_count
        FROM career_plans
        WHERE district_id IS NOT NULL
        GROUP BY district_id, district_name
        ORDER BY district_name
    """)).fetchall()
    
    return [
        {
            "district_id": str(row[0]),
            "district_name": row[1],
            "plan_count": row[2]
        }
        for row in result
    ]


@router.get("/sectors", response_model=list[str])
def get_career_planning_sectors(db: Session = Depends(get_db)):
    """Get all sectors that have career planning data."""
    
    result = db.execute(text("""
        SELECT DISTINCT sector
        FROM career_plans
        ORDER BY sector
    """)).fetchall()
    
    return [row[0] for row in result]