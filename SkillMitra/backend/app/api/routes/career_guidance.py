from app.models.demand import IndustryDemand
from app.models.career import Course, CourseSkill
from app.models.market import JobPosting
"""
Career Guidance — deterministic, database-backed, no ML.

Compares candidate career interests with job role required skills,
using the candidate_skills table (Phase 4) for real matched/missing
skill computation via skill_proficiency_levels.rank_score.
"""
import uuid
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select, func
from sqlalchemy.orm import Session, selectinload
from app.core.database import get_db
from app.core.auth import get_current_active_user, get_current_user_optional
from app.models.identity import User, CandidateProfile, CandidateCareerInterest
from app.models.career import JobRole, JobRoleSkill, CourseSkill
from app.models.phase4 import CandidateSkill
from app.models.skills import SkillProficiencyLevel, Skill
from app.models.demand import IndustryDemand, IndustrySector
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/career-guidance", tags=["Career Guidance"])


class CareerOption(BaseModel):
    job_role_id: uuid.UUID
    job_role_title: str
    source: str
    required_skill_ids: list[str]
    matched_skill_ids: list[str]
    missing_skill_ids: list[str]
    demand_signal_count: int
    relevant_course_count: int
    reasons: list[str]
    candidate_skills_status: str


@router.get(
    "",
    response_model=list[CareerOption],
    summary="Deterministic career guidance based on candidate interests and job role requirements",
)
def get_career_guidance(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Returns deterministic career guidance:
    - Reads candidate career interests (if set)
    - Compares against job role required skills using candidate_skills
    - NO ML, NO AI scoring
    """
    profile = db.scalar(
        select(CandidateProfile)
        .where(CandidateProfile.user_id == current_user.id)
        .options(selectinload(CandidateProfile.career_interests))
    )

    if not profile or not profile.career_interests:
        return []

    results = []
    for interest in profile.career_interests:
        role = db.scalar(
            select(JobRole)
            .where(JobRole.id == interest.target_job_role_id)
            .options(selectinload(JobRole.job_role_skills))
        )
        if not role:
            continue

        required_ids = [str(jrs.skill_id) for jrs in role.job_role_skills]

        # Real candidate skill matching via candidate_skills + rank_score
        candidate_skills = db.scalars(
            select(CandidateSkill).where(CandidateSkill.candidate_id == profile.id)
        ).all()
        candidate_by_skill = {cs.skill_id: cs for cs in candidate_skills}
        prof_ids = {jrs.proficiency_level_id for jrs in role.job_role_skills}
        prof_ids.update(cs.proficiency_level_id for cs in candidate_skills)
        prof_rows = db.scalars(
            select(SkillProficiencyLevel).where(SkillProficiencyLevel.id.in_(prof_ids))
        ).all() if prof_ids else []
        ranks = {row.id: row.rank_score for row in prof_rows}

        matched, missing = [], []
        for jrs in role.job_role_skills:
            cs = candidate_by_skill.get(jrs.skill_id)
            if cs is None:
                missing.append(str(jrs.skill_id))
            elif ranks.get(cs.proficiency_level_id, 0) >= ranks.get(jrs.proficiency_level_id, 0):
                matched.append(str(jrs.skill_id))
            else:
                missing.append(str(jrs.skill_id))
        demand_stmt = select(IndustryDemand.id).where(IndustryDemand.job_role_id == role.id)
        if profile.district_id:
            demand_stmt = demand_stmt.where(IndustryDemand.district_id == profile.district_id)
        demand_signal_count = len(db.scalars(demand_stmt).all())
        
        # Count actual open job postings for this role
        job_posting_stmt = select(func.count(JobPosting.id)).where(
            JobPosting.job_role_id == role.id,
            JobPosting.status == "open"
        )
        if profile.district_id:
            job_posting_stmt = job_posting_stmt.where(JobPosting.district_id == profile.district_id)
        open_job_postings_count = db.scalar(job_posting_stmt) or 0
        
        course_stmt = (
            select(Course.id)
            .join(CourseSkill)
            .where(CourseSkill.skill_id.in_([jrs.skill_id for jrs in role.job_role_skills]))
            .distinct()
        ) if required_ids else select(Course.id).where(False)
        relevant_course_count = len(db.scalars(course_stmt).all())
        
        # VALIDATION: Only include roles with actual job postings and some skill match
        # Skip if no open job postings exist
        # UNLESS there are no job postings at all in the system (empty database scenario)
        if open_job_postings_count == 0:
            # Check if there are ANY job postings in the system
            total_jobs_query = select(func.count(JobPosting.id)).where(JobPosting.status == "open")
            total_jobs = db.scalar(total_jobs_query) or 0
            if total_jobs > 0:
                continue  # Skip this role since other roles have jobs
            # If no jobs exist in system, proceed to show the role anyway (demo/empty DB scenario)
        
        # Skip if no skills match at all (0% match is not a valid recommendation)
        if len(matched) == 0 and len(required_ids) > 0:
            continue
        
        reasons = ["Matches your selected interest"]
        if demand_signal_count:
            reasons.append("Persisted demand exists for this role in your district")
        else:
            reasons.append("No persisted district demand record is available for this role")
        if relevant_course_count:
            reasons.append("At least one available course covers a required skill")
        else:
            reasons.append("No available course is mapped to this role's required skills")
        if open_job_postings_count > 0:
            reasons.append(f"{open_job_postings_count} open job posting(s) available")

        results.append(CareerOption(
            job_role_id=role.id,
            job_role_title=role.title,
            source="candidate_career_interest",
            required_skill_ids=required_ids,
            matched_skill_ids=matched,
            missing_skill_ids=missing,
            candidate_skills_status="SUPPORTED_BY_CURRENT_DATA",
            demand_signal_count=demand_signal_count,
            relevant_course_count=relevant_course_count,
            reasons=reasons,
        ))

    # If no valid recommendations found after filtering, return empty list
    # The frontend should handle this with an appropriate empty state
    return results


# =========================================================
# Public recommendation endpoint for homepage
# =========================================================

class SkillOut(BaseModel):
    id: str
    name: str
    description: str | None = None


class DemandInfoOut(BaseModel):
    district_id: str | None = None
    district_name: str | None = None
    industry_sector_id: str | None = None
    industry_sector_name: str | None = None
    job_role_id: str | None = None
    job_role_title: str | None = None
    demand_score: float | None = None
    demand_signals_count: int = 0
    relevant_job_postings_count: int = 0
    demand_trend: str | None = None


class RecommendationResponse(BaseModel):
    demand: DemandInfoOut | None = None
    required_skills: list[SkillOut] = []
    candidate_skills: list[SkillOut] = []
    skill_match_percentage: float = 0.0
    matched_skill_count: int = 0
    total_required_skills: int = 0
    missing_skills: list[SkillOut] = []
    proficiency_gap_skills: list[SkillOut] = []  # Skills candidate has but at lower proficiency
    recommended_courses: list[dict] = []
    job_readiness_percentage: float = 0.0
    candidate_authenticated: bool = False
    message: str | None = None


@router.get(
    "/recommendation",
    response_model=RecommendationResponse,
    summary="Demand-to-career recommendation for homepage",
)
def get_career_recommendation(
    district_id: uuid.UUID | None = Query(None),
    industry_sector_id: uuid.UUID | None = Query(None),
    job_role_id: uuid.UUID | None = Query(None),
    current_user: User | None = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    response = RecommendationResponse(
        demand=None,
        required_skills=[],
        candidate_skills=[],
        skill_match_percentage=0.0,
        matched_skill_count=0,
        total_required_skills=0,
        missing_skills=[],
        proficiency_gap_skills=[],
        recommended_courses=[],
        job_readiness_percentage=0.0,
        candidate_authenticated=False,
        message=None,
    )

    if not job_role_id:
        response.message = "Select a job role to see recommendations."
        return response

    # VALIDATION: First check if there are actual open job postings
    # This prevents processing roles with no open positions
    job_query = select(func.count(JobPosting.id)).where(
        JobPosting.job_role_id == job_role_id,
        JobPosting.status == "open"
    )
    if district_id:
        job_query = job_query.where(JobPosting.district_id == district_id)
    relevant_jobs_count = db.scalar(job_query) or 0

    # VALIDATION: Only proceed if there are actual open job postings
    # A recommendation with 0 job postings is not valid
    # UNLESS there are no job postings at all in the system (empty database scenario)
    if relevant_jobs_count == 0:
        # Check if there are ANY job postings in the system
        total_jobs_query = select(func.count(JobPosting.id)).where(JobPosting.status == "open")
        total_jobs = db.scalar(total_jobs_query) or 0
        if total_jobs > 0:
            response.message = "No open job postings available for this role at this time."
            return response
        # If no jobs exist in system, proceed to show the role anyway (demo/empty DB scenario)

    # Load job role with required skills
    role = db.scalar(
        select(JobRole)
        .where(JobRole.id == job_role_id)
        .options(selectinload(JobRole.job_role_skills).selectinload(JobRoleSkill.skill))
    )
    if not role:
        response.message = "Job role not found."
        return response

    required_skills = []
    for jrs in role.job_role_skills:
        if jrs.skill:
            required_skills.append(SkillOut(
                id=str(jrs.skill.id),
                name=jrs.skill.name,
                description=jrs.skill.description,
            ))
    response.total_required_skills = len(required_skills)
    response.required_skills = required_skills

    # Candidate skills (if authenticated) - Load BEFORE demand object construction
    candidate_skills = []
    matched_skill_ids = set()
    if current_user:
        profile = db.scalar(
            select(CandidateProfile)
            .where(CandidateProfile.user_id == current_user.id)
        )
        if profile:
            candidate_skill_rows = db.scalars(
                select(CandidateSkill).where(CandidateSkill.candidate_id == profile.id)
            ).all()
            candidate_by_skill = {cs.skill_id: cs for cs in candidate_skill_rows}
            prof_ids = {jrs.proficiency_level_id for jrs in role.job_role_skills}
            prof_ids.update(cs.proficiency_level_id for cs in candidate_skill_rows)
            prof_rows = db.scalars(
                select(SkillProficiencyLevel).where(SkillProficiencyLevel.id.in_(prof_ids))
            ).all() if prof_ids else []
            ranks = {row.id: row.rank_score for row in prof_rows}

            # Load skill details for candidate skills
            skill_ids = [cs.skill_id for cs in candidate_skill_rows]
            skills_by_id = {}
            if skill_ids:
                from app.models.skills import Skill
                skill_rows = db.scalars(select(Skill).where(Skill.id.in_(skill_ids))).all()
                skills_by_id = {s.id: s for s in skill_rows}

            for cs in candidate_skill_rows:
                skill = skills_by_id.get(cs.skill_id)
                if skill:
                    candidate_skills.append(SkillOut(
                        id=str(skill.id),
                        name=skill.name,
                        description=skill.description,
                    ))

            matched = 0
            matched_skill_ids = set()
            proficiency_gap_skill_ids = set()
            
            for jrs in role.job_role_skills:
                cs = candidate_by_skill.get(jrs.skill_id)
                if cs is not None:
                    # Check if candidate has the skill at required or higher proficiency
                    if ranks.get(cs.proficiency_level_id, 0) >= ranks.get(jrs.proficiency_level_id, 0):
                        matched += 1
                        matched_skill_ids.add(str(jrs.skill_id))
                    else:
                        # Candidate has the skill but at lower proficiency - count as partial match
                        matched += 1
                        matched_skill_ids.add(str(jrs.skill_id))
                        proficiency_gap_skill_ids.add(str(jrs.skill_id))

            response.candidate_authenticated = True
            response.matched_skill_count = matched
            if response.total_required_skills > 0:
                response.skill_match_percentage = round((matched / response.total_required_skills) * 100, 1)
            response.job_readiness_percentage = response.skill_match_percentage
            
            # VALIDATION: Only proceed if there's a meaningful skill match (for authenticated users)
            # Per requirements: ZERO MATCH MUST NEVER BE RECOMMENDED
            # However, we make an exception: if candidate has the required skills but at lower proficiency levels,
            # we still show the recommendation so they can see what proficiency improvements are needed
            # This is different from having NO relevant skills at all
            if response.skill_match_percentage == 0 and response.total_required_skills > 0:
                # Check if candidate has any skills at all
                if len(candidate_skills) == 0:
                    response.message = "You haven't added any skills to your profile yet. Update your skills to get personalized job recommendations."
                    response.candidate_skills = candidate_skills
                    return response
                # Check if candidate has ANY of the required skills (even at lower proficiency)
                # If yes, proceed with recommendation (they need proficiency improvements)
                # If no, reject (completely different skill set)
                candidate_skill_ids = {cs.skill_id for cs in candidate_skill_rows}
                has_any_required_skill = any(
                    jrs.skill_id in candidate_skill_ids
                    for jrs in role.job_role_skills
                )
                if not has_any_required_skill:
                    response.message = "No skill match found. Your skills don't align with this job role's requirements."
                    response.candidate_skills = candidate_skills
                    return response
                # Otherwise proceed - they have the skills but need higher proficiency

    response.candidate_skills = candidate_skills

    # Demand info
    demand_query = select(IndustryDemand).where(IndustryDemand.job_role_id == job_role_id)
    if district_id:
        demand_query = demand_query.where(IndustryDemand.district_id == district_id)
    if industry_sector_id:
        demand_query = demand_query.where(IndustryDemand.industry_sector_id == industry_sector_id)
    demand_rows = db.scalars(demand_query.order_by(IndustryDemand.aggregate_demand_score.desc())).all()

    district_name = None
    sector_name = None
    if district_id:
        from app.models.geography import District
        district = db.scalar(select(District).where(District.id == district_id))
        if district:
            district_name = district.name
    if industry_sector_id:
        sector = db.scalar(select(IndustrySector).where(IndustrySector.id == industry_sector_id))
        if sector:
            sector_name = sector.name
    
    # Ensure district_name is populated even if no demand rows exist
    if not district_name and district_id:
        from app.models.geography import District
        district = db.scalar(select(District).where(District.id == district_id))
        if district:
            district_name = district.name

    demand_score = None
    demand_trend = None
    if demand_rows:
        demand_score = demand_rows[0].aggregate_demand_score
        # Demand score classification methodology:
        # - Scale: 0-10 (normalized aggregate demand)
        # - Classification: High (>=7.5), Growing (>=5.0), Moderate (>=2.5), Low (<2.5)
        # - Source: aggregate_demand_score from industry_demand table
        # - Calculation: Sum of weighted demand signals (job postings, employer surveys)
        #   normalized to 0-10 scale for consistency across districts
        if demand_score >= 7.5:
            demand_trend = "High"
        elif demand_score >= 5.0:
            demand_trend = "Growing"
        elif demand_score >= 2.5:
            demand_trend = "Moderate"
        else:
            demand_trend = "Low"

    response.demand = DemandInfoOut(
        district_id=str(district_id) if district_id else None,
        district_name=district_name,
        industry_sector_id=str(industry_sector_id) if industry_sector_id else None,
        industry_sector_name=sector_name,
        job_role_id=str(job_role_id),
        job_role_title=role.title,
        demand_score=demand_score,
        demand_signals_count=len(demand_rows),
        relevant_job_postings_count=relevant_jobs_count,
        demand_trend=demand_trend,
    )

    # Separate missing skills from proficiency gaps (only for authenticated users)
    missing = []
    proficiency_gaps = []
    if response.candidate_authenticated:
        for jrs in role.job_role_skills:
            if str(jrs.skill_id) not in matched_skill_ids:
                # True missing skill - candidate doesn't have it at all
                if jrs.skill:
                    missing.append(SkillOut(
                        id=str(jrs.skill.id),
                        name=jrs.skill.name,
                        description=jrs.skill.description,
                    ))
            elif str(jrs.skill_id) in proficiency_gap_skill_ids:
                # Proficiency gap - candidate has skill but below required level
                if jrs.skill:
                    proficiency_gaps.append(SkillOut(
                        id=str(jrs.skill.id),
                        name=jrs.skill.name,
                        description=jrs.skill.description,
                    ))
    
    response.missing_skills = missing
    response.proficiency_gap_skills = proficiency_gaps

    # Recommended courses based on missing skills and proficiency gaps with proper ranking
    # Only recommend courses if there's a valid job recommendation (demand object exists) AND user is authenticated
    if not response.demand or not response.candidate_authenticated:
        response.recommended_courses = []
    elif missing or proficiency_gaps:
        # Combine missing skills and proficiency gaps for course recommendations
        all_gap_skills = missing + proficiency_gaps
        
        # The list contains SkillOut objects with string IDs
        # Convert to UUID objects for proper comparison
        import uuid
        gap_ids = [uuid.UUID(str(s.id)) for s in all_gap_skills]
        gap_ids_set = set(gap_ids)  # Use set for faster lookup - these are UUID objects
        
        # Get skill importance weights from job_role_skills
        skill_importance = {}
        for jrs in role.job_role_skills:
            if jrs.skill_id in gap_ids_set:
                importance_weight = 3 if jrs.importance == "mandatory" else (2 if jrs.importance == "preferred" else 1)
                skill_importance[str(jrs.skill_id)] = importance_weight
        
        # Build course query with sector filtering (strict) and skill coverage (strict)
        # District filtering is preferential for ranking, not hard exclusion
        course_query = (
            select(Course)
            .options(selectinload(Course.course_skills).selectinload(CourseSkill.skill))
            .join(CourseSkill)
            .where(
                CourseSkill.skill_id.in_(gap_ids),
                Course.status == "active"
            )
        )
        
        # Filter by sector if provided - ONLY include courses from the same sector (strict requirement)
        # This ensures incompatible sectors are excluded at the query level
        if industry_sector_id:
            course_query = course_query.where(Course.industry_sector_id == industry_sector_id)
        
        # NO strict district filtering - all district_id values are eligible:
        # - district_id = selected district → highest priority in ranking
        # - district_id = NULL → general/statewide availability (medium priority)
        # - district_id = other district → lower priority but still eligible
        # - delivery_mode = online/hybrid → additional priority bonus
        # District availability will be handled in ranking (preferential, not mandatory)
        
        course_query = course_query.distinct()
        courses = db.scalars(course_query).all()
        
        # Score and rank courses with correct priority order
        scored_courses = []
        for course in courses:
            covered_skills = []
            covered_primary_skills = []
            mandatory_skills_covered = 0
            preferred_skills_covered = 0
            
            for cs in course.course_skills:
                if cs.skill_id in gap_ids_set and cs.skill:
                    covered_skills.append(cs.skill.name)
                    if cs.is_primary:
                        covered_primary_skills.append(cs.skill.name)
                    
                    # Count by importance
                    importance = skill_importance.get(str(cs.skill_id), 1)
                    if importance == 3:  # mandatory
                        mandatory_skills_covered += 1
                    elif importance == 2:  # preferred
                        preferred_skills_covered += 1
            
            if covered_skills:
                # Priority 1: Explicit course-job-role match (not available in current schema)
                explicit_match_score = 0  # Would be +50 if course_job_role_matches existed
                
                # Priority 2: Missing mandatory skill coverage (highest weight)
                mandatory_coverage_score = mandatory_skills_covered * 20
                
                # Priority 3: Missing preferred skill coverage
                preferred_coverage_score = preferred_skills_covered * 10
                
                # Priority 4: Primary skill coverage
                primary_skill_bonus = len(covered_primary_skills) * 5
                
                # Priority 5: Sector compatibility (only same sector gets points)
                sector_compatibility = 0
                if industry_sector_id and course.industry_sector_id == industry_sector_id:
                    sector_compatibility = 8
                # Different/incompatible sectors get 0 points (excluded by query filter)
                
                # Priority 6: District availability (preferential, not mandatory)
                district_availability = 0
                if district_id:
                    if course.district_id == district_id:
                        district_availability = 5  # Same district - highest priority
                    elif course.district_id is None:
                        district_availability = 2  # district_id = NULL - general/statewide availability
                    elif course.delivery_mode == "online" or course.delivery_mode == "hybrid":
                        district_availability = 3  # Online/hybrid - available across districts
                    else:
                        district_availability = 1  # Different district - lowest priority but still eligible
                else:
                    # No district filter selected - all courses eligible with neutral priority
                    district_availability = 2
                
                # Ensure minimum score threshold for eligibility (courses must cover at least one skill)
                minimum_eligibility_score = mandatory_coverage_score + preferred_coverage_score + primary_skill_bonus
                
                if minimum_eligibility_score > 0:
                    # Total score following priority order
                    total_score = (
                        explicit_match_score +           # Priority 1
                        mandatory_coverage_score +       # Priority 2
                        preferred_coverage_score +       # Priority 3
                        primary_skill_bonus +             # Priority 4
                        sector_compatibility +            # Priority 5
                        district_availability             # Priority 6
                    )
                    
                    scored_courses.append({
                        "course": course,
                        "score": total_score,
                        "covered_skills": covered_skills,
                        "covered_primary_skills": covered_primary_skills,
                        "mandatory_skills_covered": mandatory_skills_covered,
                        "preferred_skills_covered": preferred_skills_covered,
                        "sector_compatibility": sector_compatibility,
                        "district_availability": district_availability
                    })
        
        # Sort by score (descending)
        scored_courses.sort(key=lambda x: x["score"], reverse=True)
        
        # Take top 5 recommendations
        top_courses = scored_courses[:5]
        
        for scored in top_courses:
            course = scored["course"]
            covered = scored["covered_skills"]
            covered_primary = scored["covered_primary_skills"]
            mandatory_covered = scored["mandatory_skills_covered"]
            preferred_covered = scored["preferred_skills_covered"]
            
            # Build recommendation details
            addresses_parts = []
            if mandatory_covered > 0:
                addresses_parts.append(f"{mandatory_covered} mandatory skill(s)")
            if preferred_covered > 0:
                addresses_parts.append(f"{preferred_covered} preferred skill(s)")
            
            addresses_missing = f"Addresses your missing skills: {', '.join(addresses_parts)}"
            covers = f"Covers: {', '.join(covered)}"
            
            if covered_primary:
                covers += f" (Primary skills: {', '.join(covered_primary)})"
            
            if scored["sector_compatibility"] >= 8:
                covers += " | Sector-compatible"
            if scored["district_availability"] >= 5:
                covers += " | Available in your district"
            elif scored["district_availability"] >= 3:
                covers += " | Available online"
            elif scored["district_availability"] >= 2:
                covers += " | General availability"
            elif scored["district_availability"] >= 1:
                covers += " | Available in other district"
            
            response.recommended_courses.append({
                "id": str(course.id),
                "title": course.title,
                "description": course.description,
                "covers": covered,
                "addresses_missing": addresses_missing,
                "covers_details": covers,
                "why": addresses_missing,
                "score": scored["score"]
            })
        
        # If no relevant courses found, add appropriate message
        if not response.recommended_courses:
            response.recommended_courses.append({
                "id": None,
                "title": "No relevant learning pathway found",
                "description": "No relevant learning pathway found for the selected skill gaps.",
                "covers": [],
                "addresses_missing": "No relevant learning pathway found for the selected skill gaps.",
                "covers_details": "Try broadening your search criteria or check back later for new course offerings.",
                "why": "No relevant learning pathway found for the selected skill gaps.",
                "score": 0
            })
    else:
        # No missing skills - perfect match, no courses needed
        response.recommended_courses = []

    if not response.candidate_authenticated:
        response.message = "Login to compare your skills with this role."

    # Additional validation: Ensure district_name is properly populated
    if response.demand and not response.demand.district_name and district_id:
        from app.models.geography import District
        district = db.scalar(select(District).where(District.id == district_id))
        if district:
            response.demand.district_name = district.name

    return response


# =========================================================
# Public Career Explorer endpoint for homepage
# =========================================================

class CareerExplorerRoleOut(BaseModel):
    job_role_id: str
    job_role_title: str
    required_skill_ids: list[str] = []
    demand_signal_count: int = 0
    relevant_course_count: int = 0
    open_job_postings_count: int = 0
    demand_trend: str | None = None
    reasons: list[str] = []


class CareerExplorerResponse(BaseModel):
    sector_name: str | None = None
    career_paths: list[CareerExplorerRoleOut] = []
    message: str | None = None


@router.get(
    "/career-explorer",
    response_model=CareerExplorerResponse,
    summary="Public career explorer for homepage - no authentication required",
)
def get_career_explorer(
    industry_sector_id: uuid.UUID | None = Query(None),
    db: Session = Depends(get_db),
):
    """
    Public career exploration endpoint for homepage.
    
    Returns career paths based on sector mapping through industry_demand.
    Does NOT require:
    - Authentication
    - Candidate skills
    - Open job postings (for career guidance purposes)
    
    This is separate from the candidate-specific /recommendation endpoint.
    """
    response = CareerExplorerResponse(
        sector_name=None,
        career_paths=[],
        message=None,
    )

    if not industry_sector_id:
        response.message = "Select an industry sector to explore career paths."
        return response

    # Get sector name
    sector = db.scalar(select(IndustrySector).where(IndustrySector.id == industry_sector_id))
    if not sector:
        response.message = "Industry sector not found."
        return response
    response.sector_name = sector.name

    # Get job role IDs from industry_demand for this sector
    role_ids = db.scalars(
        select(IndustryDemand.job_role_id)
        .where(IndustryDemand.industry_sector_id == industry_sector_id)
        .distinct()
    ).all()

    if not role_ids:
        response.message = f"No career paths found for '{sector.name}'. This sector may not have demand data yet."
        return response

    # Get job roles and their details
    career_paths = []
    for role_id in role_ids:
        role = db.scalar(
            select(JobRole)
            .where(JobRole.id == role_id)
            .options(selectinload(JobRole.job_role_skills))
        )
        if not role or not role.is_active:
            continue

        required_skill_ids = [str(jrs.skill_id) for jrs in role.job_role_skills]

        # Count demand signals for this role
        demand_count = db.scalar(
            select(func.count(IndustryDemand.id))
            .where(IndustryDemand.job_role_id == role_id)
            .where(IndustryDemand.industry_sector_id == industry_sector_id)
        ) or 0

        # Count relevant courses
        course_count = 0
        if required_skill_ids:
            course_count = db.scalar(
                select(func.count(Course.id))
                .join(CourseSkill)
                .where(CourseSkill.skill_id.in_([uuid.UUID(sid) for sid in required_skill_ids]))
                .where(Course.status == "active")
                .distinct()
            ) or 0

        # Count open job postings (informational, not blocking)
        job_posting_count = db.scalar(
            select(func.count(JobPosting.id))
            .where(JobPosting.job_role_id == role_id)
            .where(JobPosting.status == "open")
        ) or 0

        # Get demand trend from demand data
        demand_trend = None
        if demand_count > 0:
            demand_row = db.scalar(
                select(IndustryDemand)
                .where(IndustryDemand.job_role_id == role_id)
                .where(IndustryDemand.industry_sector_id == industry_sector_id)
                .order_by(IndustryDemand.aggregate_demand_score.desc())
            )
            if demand_row:
                score = demand_row.aggregate_demand_score
                if score >= 7.5:
                    demand_trend = "High"
                elif score >= 5.0:
                    demand_trend = "Growing"
                elif score >= 2.5:
                    demand_trend = "Moderate"
                else:
                    demand_trend = "Low"

        # Build reasons
        reasons = [f"Career path in {sector.name}"]
        if demand_count > 0:
            reasons.append(f"Based on {demand_count} demand signal(s)")
        if course_count > 0:
            reasons.append(f"{course_count} relevant course(s) available")
        if job_posting_count > 0:
            reasons.append(f"{job_posting_count} open job posting(s)")

        career_paths.append(CareerExplorerRoleOut(
            job_role_id=str(role.id),
            job_role_title=role.title,
            required_skill_ids=required_skill_ids,
            demand_signal_count=demand_count,
            relevant_course_count=course_count,
            open_job_postings_count=job_posting_count,
            demand_trend=demand_trend,
            reasons=reasons,
        ))

    response.career_paths = career_paths

    if not career_paths:
        response.message = f"No active career paths found for '{sector.name}'."

    return response
