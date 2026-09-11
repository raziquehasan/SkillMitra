
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload
from app.core.database import get_db
from app.core.auth import get_current_user_optional
from app.api.deps import get_pagination
from app.schemas.courses import CourseResponse, CourseDetailResponse
from app.schemas.common import PaginatedResponse
from app.services.course_service import CourseService
from pydantic import BaseModel, ConfigDict
from app.services.training_alignment_service import CourseAlignmentService
from app.services.course_health_service import CourseHealthScoreService

router = APIRouter(prefix="/api/v1/courses", tags=["Courses"])

class HomepageCourseOut(BaseModel):
    id: str
    title: str
    demandLevel: str
    district: str | None = None
    skills: list[str]
    durationHours: int | None = None
    courseUrl: str | None = None
    providerUrl: str | None = None
    providerName: str | None = None


@router.get("", response_model=PaginatedResponse[CourseResponse])
def list_courses(
    pagination: dict = Depends(get_pagination),
    db: Session = Depends(get_db)
):
    svc = CourseService(db)
    items, total = svc.get_courses(pagination["skip"], pagination["limit"])
    return {
        "items": items, "total": total,
        "page": pagination["page"], "page_size": pagination["page_size"],
        "pages": (total + pagination["page_size"] - 1) // pagination["page_size"]
    }


@router.get("/homepage", response_model=list[HomepageCourseOut])
def get_homepage_course_recommendations(db: Session = Depends(get_db)):
    """
    Returns top 4 active courses with URLs for homepage display.
    Filters: active status, non-null course_url, excludes legacy/demo courses.
    Ranked by demand intelligence signals.
    """
    from app.models.career import Course, CourseSkill
    from app.models.demand import IndustryDemand
    from app.models.skills import Skill
    from sqlalchemy import select, func, desc
    
    # Get active courses with URLs, excluding legacy/demo
    stmt = (
        select(Course)
        .where(
            Course.status == "active",
            Course.course_url.isnot(None),
            Course.course_url != "",
            ~Course.title.ilike("%Typing and Office Basics%")
        )
        .options(selectinload(Course.course_skills).selectinload(CourseSkill.skill))
    )
    
    courses = db.scalars(stmt).all()
    
    # Calculate demand scores for each course
    course_demand_scores = {}
    for course in courses:
        # Count demand signals for skills covered by this course
        skill_ids = [cs.skill_id for cs in course.course_skills]
        if skill_ids:
            demand_count = db.scalar(
                select(func.count())
                .select_from(IndustryDemand)
                .where(IndustryDemand.skill_id.in_(skill_ids))
            ) or 0
            course_demand_scores[course.id] = demand_count
        else:
            course_demand_scores[course.id] = 0
    
    # Sort by demand score (descending), then by title
    sorted_courses = sorted(
        courses,
        key=lambda c: (-course_demand_scores.get(c.id, 0), c.title)
    )
    
    # Take top 4
    top_courses = sorted_courses[:4]
    
    # Format response
    result = []
    for course in top_courses:
        # Get district name if available
        district_name = None
        if course.district_id:
            from app.models.geography import District
            district = db.scalar(select(District).where(District.id == course.district_id))
            district_name = district.name if district else None
        
        # Get skill names
        skill_names = [cs.skill.name for cs in course.course_skills if cs.skill][:5]
        
        # Determine demand level based on score
        demand_score = course_demand_scores.get(course.id, 0)
        if demand_score >= 5:
            demand_level = "High Demand"
        elif demand_score >= 2:
            demand_level = "Growing"
        else:
            demand_level = "Available"
        
        result.append({
            "id": str(course.id),
            "title": course.title,
            "demandLevel": demand_level,
            "district": district_name,
            "skills": skill_names,
            "durationHours": course.duration_hours,
            "courseUrl": course.course_url,
            "providerUrl": course.provider_url,
            "providerName": None  # Only set if there's a verified provider relationship
        })
    
    return result


@router.get("/{course_id}", response_model=CourseDetailResponse)
def get_course(course_id: uuid.UUID, db: Session = Depends(get_db)):
    return CourseService(db).get_course(course_id)


class CourseAlignmentOut(BaseModel):
    demand_id: str
    skill_id: str
    coverage_status: str
    matching_courses: list[dict]


@router.get("/alignment/demand/{demand_id}", response_model=CourseAlignmentOut)
def get_course_alignment_for_demand(
    demand_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    svc = CourseAlignmentService(db)
    result = svc.get_course_skill_coverage(str(demand_id))
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


class SkillGapAnalysisOut(BaseModel):
    job_role_id: str
    required_skills: list[str]
    course_analysis: list[dict]


@router.get("/alignment/skill-gap/{job_role_id}", response_model=SkillGapAnalysisOut)
def get_skill_gap_analysis(
    job_role_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    svc = CourseAlignmentService(db)
    result = svc.get_skill_gap_analysis(str(job_role_id))
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


class CourseHealthOut(BaseModel):
    course_id: str
    course_title: str
    demand_score: float | None = None
    skill_alignment_score: float | None = None
    placement_score: float | None = None
    employer_validation_score: float | None = None
    technology_relevance_score: float | None = None
    supply_demand_score: float | None = None
    overall_score: float | None = None
    status: str
    recommended_status: str
    review_status: str
    final_status: str | None = None
    explanation: str
    data_completeness: dict
    period_start: str | None = None
    period_end: str | None = None
    calculated_at: str | None = None
    placement_feedback: str | None = None
    placement_feedback_trigger: str | None = None
    model_config = ConfigDict(from_attributes=True)


@router.get("/health/{course_id}", response_model=CourseHealthOut)
def get_course_health(
    course_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    svc = CourseHealthScoreService(db)
    result = svc.calculate_course_health(str(course_id))
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


# =========================================================
# Course Detail Endpoints for Course Detail Page
# =========================================================

class CourseSkillOut(BaseModel):
    skill_id: str
    skill_name: str
    skill_description: str | None = None
    proficiency_level: str | None = None
    is_primary: bool = False


@router.get("/{course_id}/skills", response_model=list[CourseSkillOut])
def get_course_skills(
    course_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """
    Get skills taught by a specific course.
    Used for course detail page to show what skills are covered.
    """
    from app.models.career import Course, CourseSkill
    from app.models.skills import Skill, SkillProficiencyLevel
    from sqlalchemy import select
    
    course = db.scalar(
        select(Course)
        .where(Course.id == course_id)
        .options(selectinload(Course.course_skills).selectinload(CourseSkill.skill))
    )
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    result = []
    for cs in course.course_skills:
        if cs.skill:
            proficiency = None
            if cs.proficiency_level_id:
                prof = db.scalar(
                    select(SkillProficiencyLevel).where(SkillProficiencyLevel.id == cs.proficiency_level_id)
                )
                proficiency = prof.name if prof else None
            
            result.append(CourseSkillOut(
                skill_id=str(cs.skill_id),
                skill_name=cs.skill.name,
                skill_description=cs.skill.description,
                proficiency_level=proficiency,
                is_primary=cs.is_primary
            ))
    
    return result


class JobRoleOut(BaseModel):
    id: str
    title: str
    open_postings_count: int = 0


@router.get("/{course_id}/job-roles", response_model=list[JobRoleOut])
def get_course_job_roles(
    course_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """
    Get job roles related to a course through skill mapping.
    Used for course detail page to show career opportunities.
    """
    from app.models.career import Course, CourseSkill, JobRole, JobRoleSkill
    from app.models.market import JobPosting
    from sqlalchemy import select, func
    
    course = db.scalar(
        select(Course)
        .where(Course.id == course_id)
        .options(selectinload(Course.course_skills))
    )
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Get skill IDs from this course
    skill_ids = [cs.skill_id for cs in course.course_skills]
    
    if not skill_ids:
        return []
    
    # Find job roles that require these skills
    job_role_ids = db.scalars(
        select(JobRoleSkill.job_role_id)
        .where(JobRoleSkill.skill_id.in_(skill_ids))
        .distinct()
    ).all()
    
    if not job_role_ids:
        return []
    
    # Get job role details with open job posting counts
    result = []
    for role_id in job_role_ids:
        role = db.scalar(select(JobRole).where(JobRole.id == role_id))
        if role and role.is_active:
            open_postings = db.scalar(
                select(func.count(JobPosting.id))
                .where(JobPosting.job_role_id == role_id)
                .where(JobPosting.status == "open")
            ) or 0
            
            result.append(JobRoleOut(
                id=str(role.id),
                title=role.title,
                open_postings_count=open_postings
            ))
    
    return result


class CourseDemandOut(BaseModel):
    demand_level: str
    demand_signals_count: int
    relevant_job_postings_count: int
    required_skills_count: int
    explanation: str


class TrainingCentreOut(BaseModel):
    id: str
    provider_name: str
    district_name: str | None = None
    sanctioned_seats: int
    active_seats: int
    utilized_seats: int
    status: str


@router.get("/{course_id}/training-centres", response_model=list[TrainingCentreOut])
def get_course_training_centres(
    course_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """
    Get training centres that offer this course.
    Shows provider details, seats, and availability.
    """
    from app.models.career import Course
    from app.models.phase4 import CourseOffering, TrainingProvider
    from app.models.geography import District
    from sqlalchemy import select
    
    course = db.scalar(select(Course).where(Course.id == course_id))
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    try:
        # Get course offerings with provider and district details
        stmt = (
            select(CourseOffering, TrainingProvider, District)
            .join(TrainingProvider, CourseOffering.provider_id == TrainingProvider.id)
            .join(District, CourseOffering.district_id == District.id)
            .where(CourseOffering.course_id == course_id)
            .where(CourseOffering.status == "active")
        )
        
        results = db.execute(stmt).all()
        
        training_centres = []
        for offering, provider, district in results:
            training_centres.append(TrainingCentreOut(
                id=str(offering.id),
                provider_name=provider.name,
                district_name=district.name if district else None,
                sanctioned_seats=offering.sanctioned_seats,
                active_seats=offering.active_seats,
                utilized_seats=offering.utilized_seats,
                status=offering.status
            ))
        
        return training_centres
    except Exception as e:
        # If there's any error (e.g., missing relationships), return empty array
        print(f"Error fetching training centres: {e}")
        return []


@router.get("/{course_id}/demand", response_model=CourseDemandOut)
def get_course_demand(
    course_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """
    Get industry demand information for a course.
    Shows demand signals, job postings, and demand level for course skills.
    """
    from app.models.career import Course, CourseSkill
    from app.models.demand import IndustryDemand
    from app.models.market import JobPosting
    from sqlalchemy import select, func
    
    course = db.scalar(
        select(Course)
        .where(Course.id == course_id)
        .options(selectinload(Course.course_skills))
    )
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Get skill IDs from this course
    skill_ids = [cs.skill_id for cs in course.course_skills]
    
    if not skill_ids:
        return CourseDemandOut(
            demand_level="Insufficient Data",
            demand_signals_count=0,
            relevant_job_postings_count=0,
            required_skills_count=0,
            explanation="No skills mapped to this course."
        )
    
    # Count demand signals for course skills
    demand_signals_count = db.scalar(
        select(func.count())
        .select_from(IndustryDemand)
        .where(IndustryDemand.skill_id.in_(skill_ids))
    ) or 0
    
    # Count relevant job postings through job roles
    from app.models.career import JobRoleSkill
    job_role_ids = db.scalars(
        select(JobRoleSkill.job_role_id)
        .where(JobRoleSkill.skill_id.in_(skill_ids))
        .distinct()
    ).all()
    
    relevant_job_postings_count = 0
    if job_role_ids:
        relevant_job_postings_count = db.scalar(
            select(func.count())
            .select_from(JobPosting)
            .where(JobPosting.job_role_id.in_(job_role_ids))
            .where(JobPosting.status == "open")
        ) or 0
    
    # Determine demand level
    if demand_signals_count >= 10:
        demand_level = "High"
    elif demand_signals_count >= 5:
        demand_level = "Growing"
    elif demand_signals_count >= 2:
        demand_level = "Moderate"
    else:
        demand_level = "Low"
    
    explanation = f"Based on {demand_signals_count} demand signal(s) and {relevant_job_postings_count} open job posting(s) for {len(skill_ids)} skill(s) taught by this course."
    
    return CourseDemandOut(
        demand_level=demand_level,
        demand_signals_count=demand_signals_count,
        relevant_job_postings_count=relevant_job_postings_count,
        required_skills_count=len(skill_ids),
        explanation=explanation
    )


class CandidateSkillAlignmentOut(BaseModel):
    matched_skills: list[CourseSkillOut] = []
    missing_skills: list[CourseSkillOut] = []
    proficiency_gaps: list[CourseSkillOut] = []
    skill_match_percentage: float = 0.0
    total_course_skills: int = 0


@router.get("/{course_id}/candidate-alignment", response_model=CandidateSkillAlignmentOut)
def get_candidate_course_alignment(
    course_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional),
):
    """
    Get candidate skill alignment for a specific course.
    Shows which course skills the candidate already has vs missing.
    Requires authentication.
    """
    from app.models.career import Course, CourseSkill
    from app.models.phase4 import CandidateSkill, CandidateProfile
    from app.models.skills import SkillProficiencyLevel
    from app.models.identity import User
    from sqlalchemy import select
    
    if not current_user:
        # Return empty alignment for unauthenticated users
        return CandidateSkillAlignmentOut()
    
    # Get candidate profile
    profile = db.scalar(
        select(CandidateProfile).where(CandidateProfile.user_id == current_user.id)
    )
    
    if not profile:
        return CandidateSkillAlignmentOut()
    
    # Get course with skills
    course = db.scalar(
        select(Course)
        .where(Course.id == course_id)
        .options(selectinload(Course.course_skills).selectinload(CourseSkill.skill))
    )
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Get candidate skills
    candidate_skills = db.scalars(
        select(CandidateSkill).where(CandidateSkill.candidate_id == profile.id)
    ).all()
    
    candidate_skill_ids = {cs.skill_id for cs in candidate_skills}
    candidate_by_skill = {cs.skill_id: cs for cs in candidate_skills}
    
    # Get proficiency levels for comparison
    prof_ids = {cs.proficiency_level_id for cs in course.course_skills if cs.proficiency_level_id}
    prof_ids.update(cs.proficiency_level_id for cs in candidate_skills if cs.proficiency_level_id)
    
    prof_rows = []
    if prof_ids:
        prof_rows = db.scalars(
            select(SkillProficiencyLevel).where(SkillProficiencyLevel.id.in_(prof_ids))
        ).all()
    
    ranks = {row.id: row.rank_score for row in prof_rows}
    
    # Classify skills
    matched_skills = []
    missing_skills = []
    proficiency_gaps = []
    
    for cs in course.course_skills:
        if not cs.skill:
            continue
            
        skill_out = CourseSkillOut(
            skill_id=str(cs.skill_id),
            skill_name=cs.skill.name,
            skill_description=cs.skill.description,
            proficiency_level=None,
            is_primary=cs.is_primary
        )
        
        if cs.skill_id in candidate_skill_ids:
            candidate_cs = candidate_by_skill[cs.skill_id]
            
            # Check proficiency level
            if cs.proficiency_level_id and candidate_cs.proficiency_level_id:
                candidate_rank = ranks.get(candidate_cs.proficiency_level_id, 0)
                required_rank = ranks.get(cs.proficiency_level_id, 0)
                
                if candidate_rank >= required_rank:
                    skill_out.proficiency_level = "Matched"
                    matched_skills.append(skill_out)
                else:
                    skill_out.proficiency_level = "Below Required"
                    proficiency_gaps.append(skill_out)
            else:
                skill_out.proficiency_level = "Matched"
                matched_skills.append(skill_out)
        else:
            skill_out.proficiency_level = "Missing"
            missing_skills.append(skill_out)
    
    total_course_skills = len(course.course_skills)
    skill_match_percentage = 0.0
    
    if total_course_skills > 0:
        skill_match_percentage = round((len(matched_skills) / total_course_skills) * 100, 1)
    
    return CandidateSkillAlignmentOut(
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        proficiency_gaps=proficiency_gaps,
        skill_match_percentage=skill_match_percentage,
        total_course_skills=total_course_skills
    )

