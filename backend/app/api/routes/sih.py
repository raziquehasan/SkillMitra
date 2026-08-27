"""
SIH Phase 8 intelligence APIs — gap-fill endpoints that expose EXISTING
tables through the backend (no new tables, no migrations):

- GET  /api/v1/emerging-technologies            (list + sector/district filters)
- GET  /api/v1/emerging-technologies/{id}/skills (related skills)
- GET  /api/v1/course-health                    (list health scores)
- POST /api/v1/course-health/{id}/review        (human review workflow)
- GET  /api/v1/employer-surveys                 (admin)
- POST /api/v1/employer-surveys                 (admin creates survey)
- POST /api/v1/employer-surveys/{id}/responses  (employer responds -> demand_signals)
- GET  /api/v1/training-capacity                (demand vs capacity classification)

POLICY: course health review NEVER archives/deletes a course. It only
records the human decision (final_status) on the health score row.
"""
import uuid
from datetime import date, datetime, timezone
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.auth import require_roles
from app.core.database import get_db
from app.models.career import Course
from app.models.demand import DemandSignal, DataSource, EmployerSurvey, EmployerSurveyResponse, IndustryDemand
from app.models.geography import District
from app.models.identity import Employer, User
from app.models.phase4 import CourseOffering
from app.models.phase8 import CourseHealthScore, EmergingTechnology, TechnologySkill
from app.models.skills import Skill

router = APIRouter(prefix="/api/v1", tags=["SIH Intelligence"])


# ────────────────────────────────────────────────────────────────
# Emerging technologies
# ────────────────────────────────────────────────────────────────

class EmergingTechOut(BaseModel):
    id: uuid.UUID
    technology_name: str
    industry_sector_id: uuid.UUID | None = None
    district_id: uuid.UUID | None = None
    trend_direction: str
    growth_indicator: float | None = None
    observation_start: date | None = None
    observation_end: date | None = None
    confidence: str
    notes: str | None = None
    data_source_id: uuid.UUID | None = None
    model_config = ConfigDict(from_attributes=True)


class TechSkillOut(BaseModel):
    skill_id: uuid.UUID
    skill_name: str | None = None
    relevance: str


@router.get("/emerging-technologies", response_model=list[EmergingTechOut])
def list_emerging_technologies(
    industry_sector_id: uuid.UUID | None = None,
    district_id: uuid.UUID | None = None,
    trend_direction: str | None = Query(None, description="emerging|rising|stable|declining|obsolete"),
    current_user: User = Depends(require_roles("government_admin", "candidate", "employer", "training_provider")),
    db: Session = Depends(get_db),
):
    stmt = select(EmergingTechnology).order_by(EmergingTechnology.growth_indicator.desc().nulls_last())
    if industry_sector_id:
        stmt = stmt.where(EmergingTechnology.industry_sector_id == industry_sector_id)
    if district_id:
        stmt = stmt.where(EmergingTechnology.district_id == district_id)
    if trend_direction:
        stmt = stmt.where(EmergingTechnology.trend_direction == trend_direction)
    return db.scalars(stmt).all()


@router.get("/emerging-technologies/{technology_id}/skills", response_model=list[TechSkillOut])
def get_technology_skills(
    technology_id: uuid.UUID,
    current_user: User = Depends(require_roles("government_admin", "candidate", "employer", "training_provider")),
    db: Session = Depends(get_db),
):
    tech = db.get(EmergingTechnology, technology_id)
    if not tech:
        raise HTTPException(status_code=404, detail="Emerging technology not found")
    rows = db.execute(
        select(TechnologySkill, Skill.name)
        .join(Skill, Skill.id == TechnologySkill.skill_id)
        .where(TechnologySkill.technology_id == technology_id)
    ).all()
    return [
        TechSkillOut(skill_id=ts.skill_id, skill_name=name, relevance=ts.relevance)
        for ts, name in rows
    ]


# ────────────────────────────────────────────────────────────────
# Course health + human review workflow
# ────────────────────────────────────────────────────────────────

class CourseHealthOut(BaseModel):
    id: uuid.UUID
    course_id: uuid.UUID
    course_title: str | None = None
    industry_demand_score: float | None = None
    placement_score: float | None = None
    employer_validation_score: float | None = None
    curriculum_alignment_score: float | None = None
    future_trend_score: float | None = None
    supply_demand_score: float | None = None
    overall_score: float | None = None
    recommended_status: str
    review_status: str
    final_status: str | None = None
    review_notes: str | None = None
    period_start: date | None = None
    period_end: date | None = None
    score_details: dict | None = None
    model_config = ConfigDict(from_attributes=True)


class CourseHealthReviewRequest(BaseModel):
    decision: Literal["relevant", "needs_update", "oversupplied", "low_demand", "obsolete_review", "dismissed"]
    review_notes: str | None = None


@router.get("/course-health", response_model=list[CourseHealthOut])
def list_course_health(
    course_id: uuid.UUID | None = None,
    recommended_status: str | None = None,
    review_status: str | None = None,
    current_user: User = Depends(require_roles("government_admin", "training_provider")),
    db: Session = Depends(get_db),
):
    stmt = select(CourseHealthScore, Course.title).outerjoin(Course, Course.id == CourseHealthScore.course_id)
    if course_id:
        stmt = stmt.where(CourseHealthScore.course_id == course_id)
    if recommended_status:
        stmt = stmt.where(CourseHealthScore.recommended_status == recommended_status)
    if review_status:
        stmt = stmt.where(CourseHealthScore.review_status == review_status)
    rows = db.execute(stmt.order_by(CourseHealthScore.overall_score.asc().nulls_last())).all()
    return [
        CourseHealthOut(
            id=score.id, course_id=score.course_id, course_title=title,
            industry_demand_score=score.industry_demand_score,
            placement_score=score.placement_score,
            employer_validation_score=score.employer_validation_score,
            curriculum_alignment_score=score.curriculum_alignment_score,
            future_trend_score=score.future_trend_score,
            supply_demand_score=score.supply_demand_score,
            overall_score=score.overall_score,
            recommended_status=score.recommended_status,
            review_status=score.review_status,
            final_status=score.final_status,
            review_notes=score.review_notes,
            period_start=score.period_start, period_end=score.period_end,
            score_details=score.score_details,
        )
        for score, title in rows
    ]


@router.post("/course-health/{health_id}/review", response_model=CourseHealthOut)
def review_course_health(
    health_id: uuid.UUID,
    body: CourseHealthReviewRequest,
    current_user: User = Depends(require_roles("government_admin")),
    db: Session = Depends(get_db),
):
    """
    HUMAN REVIEW step. The system recommendation is advisory only;
    a government admin records the final decision here. This endpoint
    NEVER archives or deletes a course — courses.status is untouched.
    """
    score = db.get(CourseHealthScore, health_id)
    if not score:
        raise HTTPException(status_code=404, detail="Course health score not found")
    if score.review_status == "reviewed":
        raise HTTPException(status_code=409, detail="This health score has already been reviewed.")
    score.review_status = "reviewed"
    score.final_status = body.decision
    score.reviewed_by_user_id = current_user.id
    score.reviewed_at = datetime.now(timezone.utc)
    score.review_notes = body.review_notes
    db.commit()
    db.refresh(score)
    course_title = db.scalar(select(Course.title).where(Course.id == score.course_id))
    return CourseHealthOut(
        id=score.id, course_id=score.course_id, course_title=course_title,
        industry_demand_score=score.industry_demand_score,
        placement_score=score.placement_score,
        employer_validation_score=score.employer_validation_score,
        curriculum_alignment_score=score.curriculum_alignment_score,
        future_trend_score=score.future_trend_score,
        supply_demand_score=score.supply_demand_score,
        overall_score=score.overall_score,
        recommended_status=score.recommended_status,
        review_status=score.review_status,
        final_status=score.final_status,
        review_notes=score.review_notes,
        period_start=score.period_start, period_end=score.period_end,
        score_details=score.score_details,
    )


# ────────────────────────────────────────────────────────────────
# Employer surveys -> demand signals
# ────────────────────────────────────────────────────────────────

class SurveyCreate(BaseModel):
    title: str
    description: str | None = None
    start_date: date | None = None
    end_date: date | None = None


class SurveyOut(SurveyCreate):
    id: uuid.UUID
    status: str
    model_config = ConfigDict(from_attributes=True)


class SurveyResponseCreate(BaseModel):
    # Each (skill, role) pair reported as hiring difficulty becomes one demand signal.
    skill_ids: list[uuid.UUID] = Field(min_length=1)
    job_role_id: uuid.UUID | None = None
    district_id: uuid.UUID | None = None
    weight: float = 1.0


@router.get("/employer-surveys", response_model=list[SurveyOut])
def list_surveys(
    current_user: User = Depends(require_roles("government_admin", "employer")),
    db: Session = Depends(get_db),
):
    return db.scalars(select(EmployerSurvey).order_by(EmployerSurvey.created_at.desc())).all()


@router.post("/employer-surveys", response_model=SurveyOut, status_code=201)
def create_survey(
    body: SurveyCreate,
    current_user: User = Depends(require_roles("government_admin")),
    db: Session = Depends(get_db),
):
    survey = EmployerSurvey(**body.model_dump(), status="active")
    db.add(survey)
    db.commit()
    db.refresh(survey)
    return survey


@router.post("/employer-surveys/{survey_id}/responses", status_code=201)
def submit_survey_response(
    survey_id: uuid.UUID,
    body: SurveyResponseCreate,
    current_user: User = Depends(require_roles("employer")),
    db: Session = Depends(get_db),
):
    survey = db.get(EmployerSurvey, survey_id)
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    employer = db.scalar(select(Employer).where(Employer.user_id == current_user.id))
    if not employer:
        raise HTTPException(status_code=403, detail="Employer profile required")
    district_id = body.district_id or employer.district_id
    if not district_id:
        raise HTTPException(status_code=422, detail="district_id is required (no employer district on file)")

    response = EmployerSurveyResponse(survey_id=survey.id, employer_id=employer.id)
    db.add(response)
    db.flush()

    now = datetime.now(timezone.utc)
    created_signals = 0
    for skill_id in body.skill_ids:
        if not db.get(Skill, skill_id):
            raise HTTPException(status_code=422, detail=f"Unknown skill_id {skill_id}")
        db.add(DemandSignal(
            skill_id=skill_id,
            job_role_id=body.job_role_id,
            district_id=district_id,
            survey_response_id=response.id,
            raw_weight=body.weight,
            scaled_weight=body.weight,
            detected_at=now,
        ))
        created_signals += 1
    db.commit()
    return {
        "response_id": response.id,
        "survey_id": survey.id,
        "demand_signals_created": created_signals,
        "district_id": district_id,
    }


# ────────────────────────────────────────────────────────────────
# Training capacity vs demand classification
# ────────────────────────────────────────────────────────────────

@router.get("/training-capacity")
def training_capacity(
    district_id: uuid.UUID | None = None,
    current_user: User = Depends(require_roles("government_admin", "training_provider")),
    db: Session = Depends(get_db),
):
    """
    Classify demand vs available training capacity per skill:
      high demand + low capacity      -> capacity_shortfall
      high demand + adequate capacity -> capacity_adequate
      low demand + excess capacity    -> excess_capacity
    Demand = persisted industry_demand scores; capacity = active seats
    minus utilized seats across active course offerings. No hard-coded values.
    """
    demand_stmt = select(
        IndustryDemand.skill_id,
        IndustryDemand.district_id,
        IndustryDemand.aggregate_demand_score,
    )
    if district_id:
        demand_stmt = demand_stmt.where(IndustryDemand.district_id == district_id)
    demand_rows = db.execute(demand_stmt).all()

    supply_stmt = select(
        CourseOffering.district_id,
        CourseSkill.skill_id,
        CourseOffering.active_seats,
        CourseOffering.utilized_seats,
    ).join(CourseSkill, CourseSkill.course_id == CourseOffering.course_id).where(CourseOffering.status == "active")
    if district_id:
        supply_stmt = supply_stmt.where(CourseOffering.district_id == district_id)
    supply_rows = db.execute(supply_stmt).all()

    supply: dict[tuple[uuid.UUID, uuid.UUID], int] = {}
    for d_id, s_id, active, utilized in supply_rows:
        key = (d_id, s_id)
        supply[key] = supply.get(key, 0) + max((active or 0) - (utilized or 0), 0)

    # Median demand score as the high/low threshold (data-driven, not hard-coded).
    scores = sorted(r.aggregate_demand_score for r in demand_rows if r.aggregate_demand_score is not None)
    if scores:
        mid = len(scores) // 2
        threshold = scores[mid] if len(scores) % 2 else (scores[mid - 1] + scores[mid]) / 2
    else:
        threshold = 0.0

    results = []
    for d_id, s_id, demand in demand_rows:
        available = supply.get((d_id, s_id), 0)
        high_demand = (demand or 0) >= threshold and (demand or 0) > 0
        if high_demand and available <= 0:
            classification = "high_demand_low_capacity"
        elif high_demand:
            classification = "high_demand_adequate_capacity"
        elif available > 0:
            classification = "low_demand_excess_capacity"
        else:
            classification = "insufficient_data"
        results.append({
            "district_id": d_id,
            "skill_id": s_id,
            "demand_score": demand,
            "available_capacity": available,
            "classification": classification,
            "demand_threshold": threshold,
            "capacity_definition": "active seats minus utilized seats across active course offerings covering the skill",
        })
    return results