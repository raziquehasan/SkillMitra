"""Demand Intelligence API backed by raw signals and persisted rollups."""
import time
import uuid
from datetime import date, datetime, time, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_pagination
from app.models.demand import DemandSignal, IndustryDemand, DataSource, FutureDemandForecast
from app.models.career import Course, CourseSkill
from app.services.future_demand_service import FutureDemandService
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
    source_type: str | None = None,
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
    if source_type:
        stmt = stmt.join(DataSource, IndustryDemand.data_source_id == DataSource.id).where(DataSource.source_category == source_type)
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


# Future Demand Forecast endpoints

class FutureDemandForecastOut(BaseModel):
    id: uuid.UUID
    skill_id: uuid.UUID
    job_role_id: uuid.UUID | None = None
    industry_sector_id: uuid.UUID
    district_id: uuid.UUID
    proficiency_level_id: uuid.UUID
    current_demand_score: float
    current_demand_level: str
    trend_score: float
    growth_indicator: str
    forecast_level: str
    confidence_score: float
    confidence_level: str
    forecast_horizon_months: int
    forecast_horizon_start: date
    forecast_horizon_end: date
    evidence_summary: str | None = None
    algorithm_version: str
    data_points_used: int
    model_config = ConfigDict(from_attributes=True)


@router.get("/future", response_model=list[FutureDemandForecastOut], summary="Future demand forecasts")
def get_future_demand_forecasts(
    district_id: uuid.UUID | None = Query(None, description="Filter by district"),
    skill_id: uuid.UUID | None = Query(None, description="Filter by skill"),
    job_role_id: uuid.UUID | None = Query(None, description="Filter by job role"),
    forecast_level: str | None = Query(None, description="Filter by forecast level (very_high, high, growing, stable, declining)"),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of results"),
    db: Session = Depends(get_db),
):
    """Get future demand forecasts based on historical demand analysis and trend signals."""
    service = FutureDemandService(db)
    forecasts = service.get_forecasts(
        district_id=district_id,
        skill_id=skill_id,
        job_role_id=job_role_id,
        forecast_level=forecast_level,
        limit=limit
    )
    return [FutureDemandForecastOut.model_validate(forecast) for forecast in forecasts]


@router.post("/future/generate", summary="Generate future demand forecasts")
def generate_future_demand_forecasts(
    forecast_horizon_months: int = Query(12, ge=6, le=36, description="Forecast horizon in months"),
    regenerate_existing: bool = Query(False, description="Whether to update existing forecasts"),
    max_combinations: int | None = Query(None, ge=1, le=10000, description="Maximum combinations to process"),
    db: Session = Depends(get_db),
):
    """Generate future demand forecasts using existing SkillMitra data.

    This endpoint analyzes:
    - Current demand from IndustryDemand table
    - Historical trends from demand over time
    - Real-time signals from job postings

    Returns the number of forecasts generated.
    """
    service = FutureDemandService(db)
    started_at = time.perf_counter()
    result = service.generate_forecasts(
        forecast_horizon_months=forecast_horizon_months,
        regenerate_existing=regenerate_existing,
        max_combinations=max_combinations,
    )

    return {
        "status": "success",
        "message": f"Generated {result['generated']} future demand forecasts",
        "forecasts_generated": result["generated"],
        "generated": result["generated"],
        "updated": result["updated"],
        "processed": result["processed"],
        "insufficient_data": result["insufficient_data"],
        "execution_time_seconds": round(time.perf_counter() - started_at, 3),
        "forecast_horizon_months": forecast_horizon_months,
        "algorithm_version": service.algorithm_version
    }


@router.get("/future/evidence/{forecast_id}", summary="Get forecast evidence details")
def get_forecast_evidence(
    forecast_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """Get detailed evidence breakdown for a specific forecast."""
    forecast = db.get(FutureDemandForecast, forecast_id)
    if not forecast:
        raise HTTPException(status_code=404, detail="Forecast not found")

    # Get demand records used for this forecast
    demand_records = db.scalars(
        select(IndustryDemand).where(
            IndustryDemand.skill_id == forecast.skill_id,
            IndustryDemand.district_id == forecast.district_id,
        )
    ).all()

    # Get demand signals used
    signal_records = db.scalars(
        select(DemandSignal).where(
            DemandSignal.skill_id == forecast.skill_id,
            DemandSignal.district_id == forecast.district_id,
        )
    ).all()

    return {
        "forecast_id": str(forecast.id),
        "skill_id": str(forecast.skill_id),
        "district_id": str(forecast.district_id),
        "current_demand_score": forecast.current_demand_score,
        "current_demand_level": forecast.current_demand_level,
        "trend_score": forecast.trend_score,
        "growth_indicator": forecast.growth_indicator,
        "forecast_level": forecast.forecast_level,
        "confidence_score": forecast.confidence_score,
        "confidence_level": forecast.confidence_level,
        "evidence_summary": forecast.evidence_summary,
        "algorithm_version": forecast.algorithm_version,
        "data_points_used": forecast.data_points_used,
        "forecast_horizon_months": forecast.forecast_horizon_months,
        "forecast_horizon_start": str(forecast.forecast_horizon_start),
        "forecast_horizon_end": str(forecast.forecast_horizon_end),
        "generated_at": forecast.created_at.isoformat() if forecast.created_at else None,
        "evidence_sources": {
            "industry_demand_records": len(demand_records),
            "demand_signal_records": len(signal_records),
            "demand_records_sample": [
                {
                    "id": str(r.id),
                    "period_start": str(r.period_start),
                    "period_end": str(r.period_end),
                    "aggregate_demand_score": r.aggregate_demand_score,
                    "data_source_id": str(r.data_source_id) if r.data_source_id else None,
                }
                for r in demand_records[:5]
            ],
            "signal_records_sample": [
                {
                    "id": str(s.id),
                    "source_type": "job_posting" if s.job_posting_id else "employer_survey",
                    "detected_at": s.detected_at.isoformat() if s.detected_at else None,
                    "scaled_weight": s.scaled_weight,
                }
                for s in signal_records[:5]
            ],
        },
    }
