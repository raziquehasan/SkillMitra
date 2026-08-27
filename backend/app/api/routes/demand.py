"""Demand Intelligence API backed by raw signals and persisted rollups."""
import uuid
from datetime import date, datetime, time
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_pagination
from app.models.demand import DemandSignal, IndustryDemand
from app.models.career import Course, CourseSkill
from pydantic import BaseModel, ConfigDict

router = APIRouter(prefix="/api/v1/demand", tags=["Demand Intelligence"])

class DemandSignalOut(BaseModel):
    id: uuid.UUID
    skill_id: uuid.UUID | None = None
    job_role_id: uuid.UUID | None = None
    district_id: uuid.UUID | None = None
    raw_weight: float | None = None
    scaled_weight: float | None = None
    detected_at: datetime | None = None
    source_type: str
    model_config = ConfigDict(from_attributes=True)

class IndustryDemandOut(BaseModel):
    id: uuid.UUID
    industry_sector_id: uuid.UUID
    job_role_id: uuid.UUID | None = None
    skill_id: uuid.UUID | None = None
    district_id: uuid.UUID | None = None
    aggregate_demand_score: float | None = None
    proficiency_level_id: uuid.UUID | None = None
    period_start: date | None = None
    period_end: date | None = None
    model_config = ConfigDict(from_attributes=True)


class CourseDemandOut(BaseModel):
    course_id: uuid.UUID
    course_title: str
    demanded_skill_ids: list[uuid.UUID]
    covered_skill_ids: list[uuid.UUID]
    coverage_status: str

@router.get("", response_model=list[DemandSignalOut], summary="Demand signals")
def get_demand(
    district_id: uuid.UUID | None = None,
    skill_id: uuid.UUID | None = None,
    job_role_id: uuid.UUID | None = None,
    proficiency_level_id: uuid.UUID | None = None,
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    pagination: dict = Depends(get_pagination),
    db: Session = Depends(get_db),
):
    if date_from and date_to and date_from > date_to:
        raise HTTPException(status_code=422, detail="date_from must be on or before date_to")
    stmt = select(DemandSignal)
    if district_id:
        stmt = stmt.where(DemandSignal.district_id == district_id)
    if skill_id:
        stmt = stmt.where(DemandSignal.skill_id == skill_id)
    if job_role_id:
        stmt = stmt.where(DemandSignal.job_role_id == job_role_id)
    if date_from:
        stmt = stmt.where(DemandSignal.detected_at >= datetime.combine(date_from, time.min))
    if date_to:
        stmt = stmt.where(DemandSignal.detected_at <= datetime.combine(date_to, time.max))
    if proficiency_level_id:
        stmt = stmt.join(
            IndustryDemand,
            (IndustryDemand.skill_id == DemandSignal.skill_id)
            & (IndustryDemand.job_role_id == DemandSignal.job_role_id)
            & (IndustryDemand.district_id == DemandSignal.district_id),
        ).where(IndustryDemand.proficiency_level_id == proficiency_level_id)
    signals = db.scalars(stmt.offset(pagination["skip"]).limit(pagination["limit"])).all()
    return [
        DemandSignalOut.model_validate({
            **signal.__dict__,
            "source_type": "job_posting" if signal.job_posting_id else "employer_survey",
        })
        for signal in signals
    ]

@router.get("/industries", response_model=list[IndustryDemandOut], summary="Industry demand")
def get_demand_by_industry(
    industry_sector_id: uuid.UUID | None = None,
    district_id: uuid.UUID | None = None,
    job_role_id: uuid.UUID | None = None,
    skill_id: uuid.UUID | None = None,
    proficiency_level_id: uuid.UUID | None = None,
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    pagination: dict = Depends(get_pagination),
    db: Session = Depends(get_db),
):
    if date_from and date_to and date_from > date_to:
        raise HTTPException(status_code=422, detail="date_from must be on or before date_to")
    stmt = select(IndustryDemand)
    if industry_sector_id:
        stmt = stmt.where(IndustryDemand.industry_sector_id == industry_sector_id)
    if district_id:
        stmt = stmt.where(IndustryDemand.district_id == district_id)
    if job_role_id:
        stmt = stmt.where(IndustryDemand.job_role_id == job_role_id)
    if skill_id:
        stmt = stmt.where(IndustryDemand.skill_id == skill_id)
    if proficiency_level_id:
        stmt = stmt.where(IndustryDemand.proficiency_level_id == proficiency_level_id)
    if date_from:
        stmt = stmt.where(IndustryDemand.period_end >= date_from)
    if date_to:
        stmt = stmt.where(IndustryDemand.period_start <= date_to)
    items = db.scalars(stmt.offset(pagination["skip"]).limit(pagination["limit"])).all()
    return [
        IndustryDemandOut(
            id=r.id, industry_sector_id=r.industry_sector_id, job_role_id=r.job_role_id,
            skill_id=r.skill_id, district_id=r.district_id,
            aggregate_demand_score=r.aggregate_demand_score,
            proficiency_level_id=r.proficiency_level_id,
            period_start=r.period_start,
            period_end=r.period_end,
        )
        for r in items
    ]


@router.get("/courses", response_model=list[CourseDemandOut], summary="Course coverage of demanded skills")
def get_course_demand_coverage(
    district_id: uuid.UUID | None = None,
    industry_sector_id: uuid.UUID | None = None,
    job_role_id: uuid.UUID | None = None,
    skill_id: uuid.UUID | None = None,
    pagination: dict = Depends(get_pagination),
    db: Session = Depends(get_db),
):
    """Map persisted demand skill IDs to courses that teach those skills.

    This is coverage, not an oversupply or employability score.
    """
    demand_stmt = select(IndustryDemand.skill_id).distinct()
    for column, value in (
        (IndustryDemand.district_id, district_id),
        (IndustryDemand.industry_sector_id, industry_sector_id),
        (IndustryDemand.job_role_id, job_role_id),
        (IndustryDemand.skill_id, skill_id),
    ):
        if value:
            demand_stmt = demand_stmt.where(column == value)
    demanded_skill_ids = set(db.scalars(demand_stmt).all())
    if not demanded_skill_ids:
        return []
    course_stmt = (
        select(Course)
        .join(CourseSkill)
        .where(CourseSkill.skill_id.in_(demanded_skill_ids))
        .distinct()
        .offset(pagination["skip"])
        .limit(pagination["limit"])
    )
    courses = db.scalars(course_stmt).all()
    return [
        CourseDemandOut(
            course_id=course.id,
            course_title=course.title,
            demanded_skill_ids=sorted(demanded_skill_ids, key=str),
            covered_skill_ids=sorted(
                {course_skill.skill_id for course_skill in course.course_skills if course_skill.skill_id in demanded_skill_ids},
                key=str,
            ),
            coverage_status="SUPPORTED_BY_CURRENT_DATA",
        )
        for course in courses
    ]


def _get_aggregate_view(
    db: Session,
    district_id: uuid.UUID | None,
    industry_sector_id: uuid.UUID | None,
    job_role_id: uuid.UUID | None,
    skill_id: uuid.UUID | None,
    proficiency_level_id: uuid.UUID | None,
    pagination: dict,
):
    stmt = select(IndustryDemand).order_by(IndustryDemand.aggregate_demand_score.desc())
    for column, value in (
        (IndustryDemand.district_id, district_id),
        (IndustryDemand.industry_sector_id, industry_sector_id),
        (IndustryDemand.job_role_id, job_role_id),
        (IndustryDemand.skill_id, skill_id),
        (IndustryDemand.proficiency_level_id, proficiency_level_id),
    ):
        if value:
            stmt = stmt.where(column == value)
    return db.scalars(stmt.offset(pagination["skip"]).limit(pagination["limit"])).all()


def _aggregate_query_params(
    district_id: uuid.UUID | None = None,
    industry_sector_id: uuid.UUID | None = None,
    job_role_id: uuid.UUID | None = None,
    skill_id: uuid.UUID | None = None,
    proficiency_level_id: uuid.UUID | None = None,
    pagination: dict = Depends(get_pagination),
):
    return district_id, industry_sector_id, job_role_id, skill_id, proficiency_level_id, pagination


@router.get("/districts", response_model=list[IndustryDemandOut], summary="Demand by district")
def get_demand_by_district(params=Depends(_aggregate_query_params), db: Session = Depends(get_db)):
    return _get_aggregate_view(db, *params)


@router.get("/job-roles", response_model=list[IndustryDemandOut], summary="Demand by job role")
def get_demand_by_job_role(params=Depends(_aggregate_query_params), db: Session = Depends(get_db)):
    return _get_aggregate_view(db, *params)


@router.get("/skills", response_model=list[IndustryDemandOut], summary="Demand by skill")
def get_demand_by_skill(params=Depends(_aggregate_query_params), db: Session = Depends(get_db)):
    return _get_aggregate_view(db, *params)
