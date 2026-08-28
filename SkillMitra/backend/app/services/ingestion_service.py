"""Structured Phase 6 ingestion and canonical normalization services."""
from datetime import date, datetime, timezone
import re
import uuid
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.career import JobRole, JobRoleSkill
from app.models.demand import DataSource, DemandSignal
from app.models.identity import Employer
from app.models.market import JobPosting, JobPostingSkill
from app.models.phase6 import DataIngestionRun, IngestionRejectedRecord, JobRoleAlias, RawJobPosting
from app.models.skills import Skill, SkillAlias


def normalize_text(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


class IngestionService:
    def __init__(self, db: Session):
        self.db = db

    def normalize_role(self, title: str):
        normalized = normalize_text(title)
        role = next((row for row in self.db.scalars(select(JobRole)).all() if normalize_text(row.title) == normalized), None)
        if role:
            return role, "EXACT_TITLE"
        alias = next((row for row in self.db.scalars(select(JobRoleAlias)).all() if normalize_text(row.alias) == normalized), None)
        if alias:
            return self.db.get(JobRole, alias.job_role_id), "CURATED_ALIAS"
        return None, "UNMAPPED"

    def normalize_skill(self, value: str):
        normalized = normalize_text(value)
        rows = self.db.scalars(select(Skill)).all()
        skill = next((row for row in rows if normalize_text(row.name) == normalized), None)
        if skill:
            return skill, "EXACT_NAME"
        aliases = self.db.scalars(select(SkillAlias)).all()
        alias = next((row for row in aliases if normalize_text(row.alias) == normalized), None)
        return (self.db.get(Skill, alias.skill_id), "CURATED_ALIAS") if alias else (None, "UNMAPPED")

    def ingest_job_postings(self, source_id: uuid.UUID, records: list[dict]):
        source = self.db.get(DataSource, source_id)
        if not source:
            raise ValueError("Invalid data source")
        now = datetime.now(timezone.utc)
        run = DataIngestionRun(source_id=source_id, started_at=now, records_received=len(records))
        self.db.add(run)
        self.db.flush()
        accepted = rejected = duplicates = 0
        accepted_ids = []
        for record in records:
            external_id = record.get("external_id")
            duplicate = external_id and self.db.scalar(select(RawJobPosting.id).where(
                RawJobPosting.source_id == source_id,
                RawJobPosting.external_id == external_id,
            ))
            if duplicate:
                duplicates += 1
                continue
            raw = RawJobPosting(
                ingestion_run_id=run.id, source_id=source_id, external_id=external_id,
                employer_name=record.get("employer_name"), title=record.get("title", ""),
                description=record.get("description"), district_id=record.get("district_id"),
                posted_date=record.get("posted_date"), raw_payload=record,
            )
            self.db.add(raw)
            self.db.flush()
            reason = None
            if not external_id:
                reason = ("missing_external_id", "external_id is required for idempotent ingestion")
            elif not raw.title.strip():
                reason = ("missing_title", "title is required")
            employer = self.db.get(Employer, record.get("employer_id")) if record.get("employer_id") else None
            role = self.db.get(JobRole, record.get("job_role_id")) if record.get("job_role_id") else self.normalize_role(raw.title)[0]
            district_id = record.get("district_id")
            proficiency_level_id = record.get("proficiency_level_id")
            skill_ids = record.get("skill_ids") or []
            if not employer:
                reason = ("invalid_employer", "employer_id is required and must exist")
            elif not role:
                reason = ("unmapped_role", "job title has no canonical role or curated alias")
            elif not district_id:
                reason = ("missing_district", "district_id is required")
            elif not skill_ids or not proficiency_level_id:
                reason = ("missing_skill_mapping", "skill_ids and proficiency_level_id are required")
            if reason:
                raw.normalization_status = "unmapped" if reason[0] == "unmapped_role" else "rejected"
                raw.rejection_reason = reason[1]
                self.db.add(IngestionRejectedRecord(ingestion_run_id=run.id, record_key=external_id, reason_code=reason[0], reason_detail=reason[1], raw_payload=record))
                rejected += 1
                continue
            posting = JobPosting(
                employer_id=employer.id, job_role_id=role.id, district_id=district_id,
                data_source_id=source_id, title=raw.title, posted_date=record.get("posted_date"),
                status=record.get("status", "open"),
            )
            self.db.add(posting)
            self.db.flush()
            for skill_id in skill_ids:
                self.db.add(JobPostingSkill(job_posting_id=posting.id, skill_id=skill_id, proficiency_level_id=proficiency_level_id))
                exists = self.db.scalar(select(DemandSignal.id).where(DemandSignal.job_posting_id == posting.id, DemandSignal.skill_id == skill_id))
                if not exists:
                    self.db.add(DemandSignal(skill_id=skill_id, job_role_id=role.id, district_id=district_id, job_posting_id=posting.id, raw_weight=1.0, scaled_weight=1.0, detected_at=now))
            raw.normalization_status = "accepted"
            raw.canonical_job_posting_id = posting.id
            accepted += 1
            accepted_ids.append(posting.id)
        run.records_accepted = accepted
        run.records_rejected = rejected
        run.records_deduplicated = duplicates
        run.status = "completed"
        run.completed_at = datetime.now(timezone.utc)
        self.db.commit()
        return run, {"accepted": accepted, "rejected": rejected, "deduplicated": duplicates, "canonical_job_posting_ids": accepted_ids}
