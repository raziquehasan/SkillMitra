
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
    Returns top 4 active courses for homepage display.
    Filters: active status, excludes legacy/demo courses.
    Includes courses with and without URLs (defaults to CDAC for high-demand AI courses).
    Ranked by demand intelligence signals.
    Deduplicates by course title to avoid showing same course multiple times.
    """
    from app.models.career import Course, CourseSkill
    from app.models.demand import IndustryDemand
    from app.models.skills import Skill
    from sqlalchemy import select, func, desc
    
    # Get active courses with URLs, excluding legacy/demo
    # Also include high-demand courses without URLs to ensure AI courses appear
    stmt = (
        select(Course)
        .where(
            Course.status == "active",
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
    
    # Deduplicate by course title (keep first occurrence)
    seen_titles = set()
    deduplicated_courses = []
    for course in sorted_courses:
        if course.title not in seen_titles:
            seen_titles.add(course.title)
            deduplicated_courses.append(course)
    
    # Take top 4 from deduplicated list, but ensure PGCP-AI course is included
    top_courses = deduplicated_courses[:4]
    
    # Check if PGCP-AI is in top 4, if not, replace the lowest demand course
    pgcp_ai_courses = [c for c in deduplicated_courses if "PGCP-AI" in c.title or "PG Certificate Programme in Artificial Intelligence" in c.title]
    pgcp_ai_in_top_4 = any("PGCP-AI" in c.title or "PG Certificate Programme in Artificial Intelligence" in c.title for c in top_courses)
    
    if not pgcp_ai_in_top_4 and pgcp_ai_courses:
        # Replace the lowest demand course in top 4 with PGCP-AI
        lowest_demand_idx = min(range(len(top_courses)), key=lambda i: course_demand_scores.get(top_courses[i].id, 0))
        top_courses[lowest_demand_idx] = pgcp_ai_courses[0]
    
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


# =========================================================
# Curriculum Analysis Endpoints
# =========================================================

class CurriculumGapOut(BaseModel):
    course_id: str
    course_title: str
    required_skill_id: str
    required_skill_name: str
    curriculum_coverage: str
    gap: str
    priority: str


@router.get("/curriculum/gaps", response_model=list[CurriculumGapOut])
def get_curriculum_gaps(
    district_id: str | None = None,
    industry_sector_id: str | None = None,
    db: Session = Depends(get_db),
):
    """
    Get curriculum gaps analysis.
    Shows courses that don't fully cover industry-required skills.
    """
    from app.models.career import Course, CourseSkill
    from app.models.demand import IndustryDemand
    from app.models.skills import Skill
    from app.models.geography import District
    from sqlalchemy import select, func, and_
    
    # Get industry demand for skills
    stmt = select(IndustryDemand)
    if district_id:
        stmt = stmt.where(IndustryDemand.district_id == district_id)
    if industry_sector_id:
        stmt = stmt.where(IndustryDemand.industry_sector_id == industry_sector_id)
    
    demand_records = db.scalars(stmt).all()
    
    # Get required skill IDs from demand
    required_skill_ids = list({d.skill_id for d in demand_records if d.skill_id})
    
    if not required_skill_ids:
        return []
    
    # Get courses and their skills
    courses_stmt = select(Course).where(Course.status == "active")
    if district_id:
        courses_stmt = courses_stmt.where(Course.district_id == district_id)
    
    courses_stmt = courses_stmt.options(selectinload(Course.course_skills).selectinload(CourseSkill.skill))
    courses = db.scalars(courses_stmt).all()
    
    # Analyze gaps
    gaps = []
    for course in courses:
        course_skill_ids = {cs.skill_id for cs in course.course_skills if cs.skill}
        
        # Find required skills not covered by this course
        missing_skills = required_skill_ids - course_skill_ids
        
        for missing_skill_id in missing_skills:
            skill = db.scalar(select(Skill).where(Skill.id == missing_skill_id))
            if skill:
                # Calculate coverage percentage
                coverage = len(course_skill_ids & required_skill_ids) / len(required_skill_ids) * 100 if required_skill_ids else 0
                
                # Determine priority based on demand
                demand_count = sum(1 for d in demand_records if d.skill_id == missing_skill_id)
                priority = "High" if demand_count >= 5 else "Medium" if demand_count >= 2 else "Low"
                
                gaps.append(CurriculumGapOut(
                    course_id=str(course.id),
                    course_title=course.title,
                    required_skill_id=str(missing_skill_id),
                    required_skill_name=skill.name,
                    curriculum_coverage=f"{coverage:.1f}%",
                    gap=f"Missing {skill.name}",
                    priority=priority
                ))
    
    return gaps[:50]  # Limit to 50 results


class OutdatedContentOut(BaseModel):
    course_id: str
    course_title: str
    current_content: str
    current_industry_skill: str
    review_status: str
    suggested_update: str
    last_updated: str | None = None


@router.get("/curriculum/outdated-content", response_model=list[OutdatedContentOut])
def get_outdated_content(
    district_id: str | None = None,
    db: Session = Depends(get_db),
):
    """
    Get courses with potentially outdated content.
    Based on skill demand trends and technology changes.
    """
    from app.models.career import Course, CourseSkill
    from app.models.demand import IndustryDemand
    from app.models.skills import Skill
    from sqlalchemy import select, func, and_
    
    # Get high-demand skills
    high_demand_skills = db.scalars(
        select(IndustryDemand.skill_id)
        .group_by(IndustryDemand.skill_id)
        .having(func.count() >= 3)
    ).all()
    
    if not high_demand_skills:
        return []
    
    # Get courses
    courses_stmt = select(Course).where(Course.status == "active")
    if district_id:
        courses_stmt = courses_stmt.where(Course.district_id == district_id)
    
    courses_stmt = courses_stmt.options(selectinload(Course.course_skills).selectinload(CourseSkill.skill))
    courses = db.scalars(courses_stmt).all()
    
    outdated = []
    for course in courses:
        course_skill_ids = {cs.skill_id for cs in course.course_skills if cs.skill}
        
        # Check if course covers high-demand skills
        missing_high_demand = set(high_demand_skills) - course_skill_ids
        
        if missing_high_demand:
            # Get names of missing high-demand skills
            missing_skill_names = []
            for skill_id in missing_high_demand:
                skill = db.scalar(select(Skill).where(Skill.id == skill_id))
                if skill:
                    missing_skill_names.append(skill.name)
            
            if missing_skill_names:
                current_skills = [cs.skill.name for cs in course.course_skills if cs.skill][:3]
                outdated.append(OutdatedContentOut(
                    course_id=str(course.id),
                    course_title=course.title,
                    current_content=", ".join(current_skills) if current_skills else "Basic skills",
                    current_industry_skill=", ".join(missing_skill_names[:2]),
                    review_status="Needs Review",
                    suggested_update=f"Add skills: {', '.join(missing_skill_names[:2])}",
                    last_updated=course.updated_at.isoformat() if course.updated_at else None
                ))
    
    return outdated[:30]  # Limit to 30 results


class CourseDemandAnalysisOut(BaseModel):
    course_id: str
    course_title: str
    demand_level: str
    demand_signals_count: int
    oversupply_indicators: list[str]
    recommendation: str


@router.get("/curriculum/demand-analysis", response_model=list[CourseDemandAnalysisOut])
def get_course_demand_analysis(
    district_id: str | None = None,
    db: Session = Depends(get_db),
):
    """
    Analyze course demand and identify oversupplied courses.
    """
    from app.models.career import Course, CourseSkill
    from app.models.demand import IndustryDemand
    from app.models.phase4 import CourseOffering
    from sqlalchemy import select, func, and_
    
    # Get courses
    courses_stmt = select(Course).where(Course.status == "active")
    if district_id:
        courses_stmt = courses_stmt.where(Course.district_id == district_id)
    
    courses_stmt = courses_stmt.options(selectinload(Course.course_skills))
    courses = db.scalars(courses_stmt).all()
    
    analysis = []
    for course in courses:
        course_skill_ids = [cs.skill_id for cs in course.course_skills]
        
        # Count demand signals
        demand_count = 0
        if course_skill_ids:
            demand_count = db.scalar(
                select(func.count())
                .select_from(IndustryDemand)
                .where(IndustryDemand.skill_id.in_(course_skill_ids))
            ) or 0
        
        # Check for oversupply indicators
        oversupply_indicators = []
        
        # Check if too many offerings
        offering_count = db.scalar(
            select(func.count())
            .select_from(CourseOffering)
            .where(CourseOffering.course_id == course.id)
            .where(CourseOffering.status == "active")
        ) or 0
        
        if offering_count > 10:
            oversupply_indicators.append(f"High offering count: {offering_count}")
        
        # Determine demand level
        if demand_count >= 10:
            demand_level = "High Demand"
            recommendation = "Expand capacity"
        elif demand_count >= 5:
            demand_level = "Growing"
            recommendation = "Maintain current capacity"
        elif demand_count >= 2:
            demand_level = "Moderate"
            recommendation = "Monitor demand"
        else:
            demand_level = "Low Demand"
            recommendation = "Consider reducing offerings"
            if offering_count > 5:
                oversupply_indicators.append("Low demand with high capacity")
        
        analysis.append(CourseDemandAnalysisOut(
            course_id=str(course.id),
            course_title=course.title,
            demand_level=demand_level,
            demand_signals_count=demand_count,
            oversupply_indicators=oversupply_indicators,
            recommendation=recommendation
        ))
    
    return analysis[:40]  # Limit to 40 results


class SkillQualificationMappingOut(BaseModel):
    skill_id: str
    skill_name: str
    qualification_id: str | None = None
    qualification_name: str | None = None
    coverage_percentage: float
    mapped_courses: list[str]


@router.get("/curriculum/skill-qualification-mapping", response_model=list[SkillQualificationMappingOut])
def get_skill_qualification_mapping(
    industry_sector_id: str | None = None,
    db: Session = Depends(get_db),
):
    """
    Map skills to qualifications and show course coverage.
    """
    from app.models.career import Course, CourseSkill
    from app.models.skills import Skill
    from sqlalchemy import select, func
    
    # Get skills
    skills_stmt = select(Skill).where(Skill.is_active == True)
    skills = db.scalars(skills_stmt).all()
    
    mapping = []
    for skill in skills:
        # Get courses that teach this skill
        course_ids = db.scalars(
            select(CourseSkill.course_id)
            .where(CourseSkill.skill_id == skill.id)
        ).all()
        
        # Get course titles
        course_titles = []
        if course_ids:
            courses = db.scalars(
                select(Course).where(Course.id.in_(course_ids)).where(Course.status == "active")
            ).all()
            course_titles = [c.title for c in courses[:5]]  # Limit to 5 courses
        
        # Calculate coverage (percentage of courses that teach this skill)
        total_courses = db.scalar(select(func.count()).select_from(Course).where(Course.status == "active")) or 1
        coverage = (len(course_ids) / total_courses * 100) if total_courses > 0 else 0
        
        mapping.append(SkillQualificationMappingOut(
            skill_id=str(skill.id),
            skill_name=skill.name,
            qualification_id=None,  # Can be mapped to qualification system later
            qualification_name=None,
            coverage_percentage=round(coverage, 1),
            mapped_courses=course_titles
        ))
    
    return mapping[:50]  # Limit to 50 results


class RecommendedUpdateOut(BaseModel):
    course_id: str
    course_title: str
    update_type: str
    priority: str
    suggested_changes: list[str]
    impact: str


@router.get("/curriculum/recommended-updates", response_model=list[RecommendedUpdateOut])
def get_recommended_updates(
    district_id: str | None = None,
    db: Session = Depends(get_db),
):
    """
    Get recommended course updates based on demand and skill gaps.
    """
    from app.models.career import Course, CourseSkill
    from app.models.demand import IndustryDemand
    from app.models.skills import Skill
    from sqlalchemy import select, func
    
    # Get high-demand skills not well covered
    high_demand_skills = db.scalars(
        select(IndustryDemand.skill_id)
        .group_by(IndustryDemand.skill_id)
        .having(func.count() >= 5)
    ).all()
    
    if not high_demand_skills:
        return []
    
    # Get courses
    courses_stmt = select(Course).where(Course.status == "active")
    if district_id:
        courses_stmt = courses_stmt.where(Course.district_id == district_id)
    
    courses_stmt = courses_stmt.options(selectinload(Course.course_skills).selectinload(CourseSkill.skill))
    courses = db.scalars(courses_stmt).all()
    
    recommendations = []
    for course in courses:
        course_skill_ids = {cs.skill_id for cs in course.course_skills if cs.skill}
        
        # Find high-demand skills missing from this course
        missing_high_demand = set(high_demand_skills) - course_skill_ids
        
        if missing_high_demand:
            # Get skill names
            missing_skill_names = []
            for skill_id in missing_high_demand:
                skill = db.scalar(select(Skill).where(Skill.id == skill_id))
                if skill:
                    missing_skill_names.append(skill.name)
            
            if missing_skill_names:
                # Determine priority based on how many high-demand skills are missing
                priority = "High" if len(missing_high_demand) >= 3 else "Medium" if len(missing_high_demand) >= 2 else "Low"
                
                recommendations.append(RecommendedUpdateOut(
                    course_id=str(course.id),
                    course_title=course.title,
                    update_type="Add Skills",
                    priority=priority,
                    suggested_changes=[f"Add skill: {name}" for name in missing_skill_names[:3]],
                    impact=f"Will align course with {len(missing_high_demand)} high-demand skills"
                ))
    
    return recommendations[:30]  # Limit to 30 results


class EmployerTrainingOutcomeOut(BaseModel):
    course_id: str
    course_title: str
    employer_requirements: list[str]
    training_outcomes: list[str]
    alignment_score: float
    gaps: list[str]


@router.get("/curriculum/employer-training-outcomes", response_model=list[EmployerTrainingOutcomeOut])
def get_employer_training_outcomes(
    district_id: str | None = None,
    industry_sector_id: str | None = None,
    db: Session = Depends(get_db),
):
    """
    Compare employer requirements with training outcomes.
    """
    from app.models.career import Course, CourseSkill
    from app.models.demand import IndustryDemand
    from app.models.skills import Skill
    from app.models.market import JobPosting
    from sqlalchemy import select, func
    
    # Get employer requirements from job postings
    job_postings_stmt = select(JobPosting).where(JobPosting.status == "open")
    if district_id:
        job_postings_stmt = job_postings_stmt.where(JobPosting.district_id == district_id)
    
    job_postings = db.scalars(job_postings_stmt).all()
    
    # Collect required skills from job postings
    required_skills = set()
    for posting in job_postings:
        if posting.job_posting_skills:
            for jps in posting.job_posting_skills:
                if jps.skill:
                    required_skills.add(jps.skill.name)
    
    if not required_skills:
        return []
    
    # Get courses
    courses_stmt = select(Course).where(Course.status == "active")
    if district_id:
        courses_stmt = courses_stmt.where(Course.district_id == district_id)
    
    courses_stmt = courses_stmt.options(selectinload(Course.course_skills).selectinload(CourseSkill.skill))
    courses = db.scalars(courses_stmt).all()
    
    outcomes = []
    for course in courses:
        course_skills = {cs.skill.name for cs in course.course_skills if cs.skill}
        
        # Calculate alignment
        aligned_skills = required_skills & course_skills
        missing_skills = required_skills - course_skills
        
        alignment_score = (len(aligned_skills) / len(required_skills) * 100) if required_skills else 0
        
        outcomes.append(EmployerTrainingOutcomeOut(
            course_id=str(course.id),
            course_title=course.title,
            employer_requirements=list(required_skills)[:5],
            training_outcomes=list(course_skills)[:5],
            alignment_score=round(alignment_score, 1),
            gaps=list(missing_skills)[:5]
        ))
    
    return outcomes[:30]  # Limit to 30 results

