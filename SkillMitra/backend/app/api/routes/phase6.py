"""Phase 6 evidence ingestion and validation APIs."""
import uuid
from datetime import date, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.auth import require_roles
from app.core.database import get_db
from app.models.demand import DataSource
from app.models.identity import User, Employer
from app.models.phase6 import (
    DataIngestionRun, EmployerCurriculumValidation, IndustryConsultation,
    IngestionRejectedRecord, JobRoleAlias, RawJobPosting,
)
from app.services.ingestion_service import IngestionService

router = APIRouter(prefix="/api/v1", tags=["Phase 6 Evidence"])


class SourceCreate(BaseModel):
    name: str
    source_category: str
    description: str | None = None
    source_url: str | None = None
    organization: str | None = None


class SourceOut(SourceCreate):
    id: uuid.UUID
    status: str
    model_config = ConfigDict(from_attributes=True)


class JobRecord(BaseModel):
    external_id: str
    title: str = Field(min_length=1)
    employer_id: uuid.UUID
    district_id: uuid.UUID
    job_role_id: uuid.UUID | None = None
    skill_ids: list[uuid.UUID] = Field(min_length=1)
    proficiency_level_id: uuid.UUID
    employer_name: str | None = None
    description: str | None = None
    posted_date: date | None = None
    status: str = "open"


class JobIngestionRequest(BaseModel):
    source_id: uuid.UUID
    records: list[JobRecord]


class ConsultationCreate(BaseModel):
    employer_id: uuid.UUID
    district_id: uuid.UUID | None = None
    title: str
    consultation_date: date
    feedback: str | None = None


class ValidationCreate(BaseModel):
    employer_id: uuid.UUID
    course_id: uuid.UUID
    curriculum_version_id: uuid.UUID | None = None
    status: str
    feedback: str | None = None


@router.get("/ingestion/sources", response_model=list[SourceOut])
def list_sources(current_user: User = Depends(require_roles("government_admin")), db: Session = Depends(get_db)):
    return db.scalars(select(DataSource).order_by(DataSource.name)).all()


@router.post("/ingestion/sources", response_model=SourceOut, status_code=201)
def create_source(data: SourceCreate, current_user: User = Depends(require_roles("government_admin")), db: Session = Depends(get_db)):
    source = DataSource(**data.model_dump())
    db.add(source)
    db.commit()
    db.refresh(source)
    return source


@router.post("/ingestion/job-postings")
def ingest_job_postings(data: JobIngestionRequest, current_user: User = Depends(require_roles("government_admin")), db: Session = Depends(get_db)):
    try:
        run, summary = IngestionService(db).ingest_job_postings(data.source_id, [record.model_dump(mode="json") for record in data.records])
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return {"ingestion_run_id": run.id, **summary, "status": run.status}


@router.get("/ingestion/runs")
def list_ingestion_runs(current_user: User = Depends(require_roles("government_admin")), db: Session = Depends(get_db)):
    rows = db.scalars(select(DataIngestionRun).order_by(DataIngestionRun.started_at.desc())).all()
    return [{"id": row.id, "source_id": row.source_id, "status": row.status,
             "started_at": row.started_at, "completed_at": row.completed_at,
             "records_received": row.records_received, "records_accepted": row.records_accepted,
             "records_rejected": row.records_rejected, "records_deduplicated": row.records_deduplicated}
            for row in rows]


@router.get("/ingestion/runs/{run_id}/rejected")
def list_rejected_records(run_id: uuid.UUID, current_user: User = Depends(require_roles("government_admin")), db: Session = Depends(get_db)):
    rows = db.scalars(select(IngestionRejectedRecord).where(IngestionRejectedRecord.ingestion_run_id == run_id)).all()
    return [{"id": row.id, "record_key": row.record_key, "reason_code": row.reason_code,
             "reason_detail": row.reason_detail, "raw_payload": row.raw_payload}
            for row in rows]


@router.get("/ingestion/normalize/skills/{name}")
def normalize_skill(name: str, current_user: User = Depends(require_roles("government_admin")), db: Session = Depends(get_db)):
    skill, method = IngestionService(db).normalize_skill(name)
    return {"input": name, "skill_id": skill.id if skill else None, "status": method if skill else "UNMAPPED"}


@router.get("/ingestion/normalize/roles/{title}")
def normalize_role(title: str, current_user: User = Depends(require_roles("government_admin")), db: Session = Depends(get_db)):
    role, method = IngestionService(db).normalize_role(title)
    return {"input": title, "job_role_id": role.id if role else None, "status": method if role else "UNMAPPED"}


@router.get("/government/data-freshness")
def data_freshness(current_user: User = Depends(require_roles("government_admin")), db: Session = Depends(get_db)):
    sources = db.scalars(select(DataSource)).all()
    result = []
    for source in sources:
        latest_run = db.scalar(select(DataIngestionRun).where(
            DataIngestionRun.source_id == source.id,
            DataIngestionRun.status == "completed",
        ).order_by(DataIngestionRun.completed_at.desc()))
        result.append({"source_id": source.id, "source_name": source.name,
                       "source_last_updated_at": source.updated_at,
                       "last_ingested_at": latest_run.completed_at if latest_run else None,
                       "freshness_status": "UNKNOWN",
                       "reason": "No configured freshness threshold"})
    return result


@router.post("/employer/consultations", status_code=201)
def create_consultation(data: ConsultationCreate, current_user: User = Depends(require_roles("employer")), db: Session = Depends(get_db)):
    employer = db.scalar(select(Employer).where(Employer.user_id == current_user.id, Employer.id == data.employer_id))
    if not employer:
        raise HTTPException(status_code=403, detail="Employer ownership required")
    consultation = IndustryConsultation(**data.model_dump())
    db.add(consultation)
    db.commit()
    db.refresh(consultation)
    return consultation


@router.post("/employer/curriculum-validations", status_code=201)
def create_curriculum_validation(data: ValidationCreate, current_user: User = Depends(require_roles("employer")), db: Session = Depends(get_db)):
    employer = db.scalar(select(Employer).where(Employer.user_id == current_user.id, Employer.id == data.employer_id))
    if not employer:
        raise HTTPException(status_code=403, detail="Employer ownership required")
    validation = EmployerCurriculumValidation(**data.model_dump())
    db.add(validation)
    db.commit()
    db.refresh(validation)
    return validation


@router.get("/government/employer-validation")
def employer_validations(current_user: User = Depends(require_roles("government_admin")), db: Session = Depends(get_db)):
    rows = db.scalars(select(EmployerCurriculumValidation).order_by(EmployerCurriculumValidation.created_at.desc())).all()
    return [{"id": row.id, "employer_id": row.employer_id, "course_id": row.course_id,
             "curriculum_version_id": row.curriculum_version_id, "status": row.status,
             "feedback": row.feedback, "source": row.source, "created_at": row.created_at}
            for row in rows]
