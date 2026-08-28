"""Import Maharashtra District-wise Skill Demand CSV into SkillMitra.

Usage:
    python -m app.scripts.import_maharashtra_skill_data --dry-run
    python -m app.scripts.import_maharashtra_skill_data

The CSV is expected at:
    data/district_wise_skill_data_merged.csv.xls
(the file has a .csv.xls extension but is plain CSV content).

This script follows the existing ingestion architecture:
    - DataSource provenance
    - DataIngestionRun tracking
    - IngestionRejectedRecord for failures
    - Idempotent re-runs

For improved skill taxonomy (new skills, aliases, categories) and
re-processing of review rows, use:
    python -m app.scripts.improve_skill_taxonomy

Training programs without canonical course matches preserve source text
in district training plan item rationales.
"""
from __future__ import annotations

import csv
import hashlib
import os
import re
import sys
from dataclasses import dataclass, field
from datetime import date, datetime, timezone
from io import StringIO
from pathlib import Path
from typing import Any

os.environ["DEBUG"] = "False"

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.career import Course, JobRole, JobRoleSkill
from app.models.demand import DataSource, IndustryDemand, IndustrySector
from app.models.geography import District
from app.models.phase4 import DistrictTrainingPlan, DistrictTrainingPlanItem, TrainingProvider
from app.models.phase6 import DataIngestionRun, IngestionRejectedRecord
from app.models.skills import Skill, SkillAlias, SkillCategory, SkillProficiencyLevel

# ─────────────────────────────────────────────────────────────────────
# Constants
# ─────────────────────────────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).resolve().parents[3]
DATA_FILE = PROJECT_ROOT / "data" / "district_wise_skill_data_merged.csv.xls"
SOURCE_NAME = "Maharashtra District-wise Skill Demand Dataset"
SOURCE_CATEGORY = "district_skill_demand"
SOURCE_DESCRIPTION = (
    "District-wise skill demand dataset for Maharashtra. "
    "Contains demand levels, skill gaps, recommended training, "
    "and training availability per district and sector."
)
DEMAND_LEVEL_MAP = {
    "high": 3.0,
    "medium high": 2.0,
    "medium": 1.0,
}
DEFAULT_PROFICIENCY_CODE = "L3"
IMPORT_PERIOD_START = date(2024, 4, 1)
IMPORT_PERIOD_END = date(2025, 3, 31)


# ─────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────
def normalize_text(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def _blank_to_none(value: str) -> str | None:
    cleaned = re.sub(r"\s+", " ", value.strip())
    if not cleaned or cleaned == "-":
        return None
    return cleaned


def row_fingerprint(row: dict[str, str]) -> str:
    key = "|".join(
        row.get(col, "").strip().casefold()
        for col in ("District", "Sector", "Skill/Job Role", "Demand Level", "Skill Gap")
    )
    return hashlib.sha256(key.encode()).hexdigest()


# ─────────────────────────────────────────────────────────────────────
# Source file audit
# ─────────────────────────────────────────────────────────────────────
@dataclass(frozen=True)
class SourceFileAudit:
    path: Path
    filename: str
    size_bytes: int
    sha256: str
    headers: tuple[str, ...]
    rows: tuple[dict[str, str], ...]
    duplicate_keys: tuple[tuple[str, int, int], ...] = ()
    encoding_used: str = "utf-8"

    @property
    def row_count(self) -> int:
        return len(self.rows)

    @property
    def is_valid(self) -> bool:
        return self.row_count > 0 and len(self.headers) > 0


def audit_source_file(path: Path) -> SourceFileAudit:
    raw_bytes = path.read_bytes()
    sha256 = hashlib.sha256(raw_bytes).hexdigest()

    for enc in ("utf-8", "utf-8-sig", "latin-1"):
        try:
            text = raw_bytes.decode(enc)
            break
        except UnicodeDecodeError:
            continue
    else:
        raise RuntimeError(f"Cannot decode {path}")

    reader = csv.DictReader(StringIO(text))
    headers = tuple(reader.fieldnames or [])
    rows: list[dict[str, str]] = []
    seen: dict[str, int] = {}
    duplicates: list[tuple[str, int, int]] = []
    for line_number, row in enumerate(reader, start=2):
        rows.append(row)
        fp = row_fingerprint(row)
        if fp in seen:
            duplicates.append((fp, seen[fp], line_number))
        else:
            seen[fp] = line_number

    return SourceFileAudit(
        path=path,
        filename=path.name,
        size_bytes=len(raw_bytes),
        sha256=sha256,
        headers=headers,
        rows=tuple(rows),
        duplicate_keys=tuple(duplicates),
        encoding_used=enc,
    )


# ─────────────────────────────────────────────────────────────────────
# Mapping caches
# ─────────────────────────────────────────────────────────────────────
@dataclass
class MapperCaches:
    districts_by_name: dict[str, District] = field(default_factory=dict)
    sectors_by_name: dict[str, Any] = field(default_factory=dict)
    roles_by_name: dict[str, JobRole] = field(default_factory=dict)
    skills_by_name: dict[str, Skill] = field(default_factory=dict)
    skill_aliases_by_name: dict[str, SkillAlias] = field(default_factory=dict)
    courses_by_name: dict[str, Course] = field(default_factory=dict)
    providers_by_name: dict[str, TrainingProvider] = field(default_factory=dict)
    proficiency_by_code: dict[str, SkillProficiencyLevel] = field(default_factory=dict)

    def load(self, db: Session) -> None:
        for d in db.scalars(select(District)).all():
            self.districts_by_name[d.name.strip()] = d
        for s in db.scalars(select(IndustrySector)).all():
            self.sectors_by_name[normalize_text(s.name)] = s
            self.sectors_by_name[s.name.strip()] = s
        for r in db.scalars(select(JobRole)).all():
            self.roles_by_name[normalize_text(r.title)] = r
            self.roles_by_name[r.title.strip()] = r
        for s in db.scalars(select(Skill)).all():
            self.skills_by_name[normalize_text(s.name)] = s
            self.skills_by_name[s.name.strip()] = s
        for a in db.scalars(select(SkillAlias)).all():
            self.skill_aliases_by_name[normalize_text(a.alias)] = a
            self.skill_aliases_by_name[a.alias.strip()] = a
        for c in db.scalars(select(Course)).all():
            self.courses_by_name[normalize_text(c.title)] = c
            self.courses_by_name[c.title.strip()] = c
        for p in db.scalars(select(TrainingProvider)).all():
            self.providers_by_name[normalize_text(p.name)] = p
            self.providers_by_name[p.name.strip()] = p
        for p in db.scalars(select(SkillProficiencyLevel)).all():
            self.proficiency_by_code[p.code] = p


# ─────────────────────────────────────────────────────────────────────
# Row-level mapping
# ─────────────────────────────────────────────────────────────────────
@dataclass
class RowResult:
    row_number: int
    fingerprint: str
    raw: dict[str, str]
    status: str = "pending"
    reason: str | None = None

    district_id: str | None = None
    district_status: str = "unmapped"

    sector_id: str | None = None
    sector_status: str = "unmapped"
    sector_created: bool = False

    job_role_id: str | None = None
    job_role_status: str = "unmapped"
    job_role_created: bool = False
    job_role_alias_created: bool = False

    skill_gap_text: str = ""
    mapped_skill_ids: list[str] = field(default_factory=list)
    skill_gap_status: str = "unmapped"

    demand_score: float | None = None
    demand_status: str = "unmapped"

    recommended_text: str = ""
    training_program_text: str = ""
    training_availability_text: str = ""

    plan_item_id: str | None = None
    demand_id: str | None = None


def map_district(name: str, caches: MapperCaches) -> tuple[str | None, str]:
    clean = name.strip()
    # Exact match first
    if clean in caches.districts_by_name:
        return str(caches.districts_by_name[clean].id), "MATCHED"
    # Normalized match
    norm = normalize_text(clean)
    for dname, district in caches.districts_by_name.items():
        if normalize_text(dname) == norm:
            return str(district.id), "MATCHED_NORMALIZED"
    # Special cases
    if clean == "Mumbai":
        # Ambiguous: Mumbai City vs Mumbai Suburban
        return None, "AMBIGUOUS_MUMBAI"
    return None, "UNMAPPED"


def map_sector(name: str, caches: MapperCaches, db: Session) -> tuple[str | None, str, bool]:
    clean = name.strip()
    norm = normalize_text(clean)

    # Exact match
    for sname, sector in caches.sectors_by_name.items():
        if sname == clean:
            return str(sector.id), "MATCHED", False

    # Normalized match
    for sname, sector in caches.sectors_by_name.items():
        if normalize_text(sname) == norm:
            return str(sector.id), "MATCHED_NORMALIZED", False

    # Create new sector
    code = re.sub(r"[^A-Z0-9]", "_", clean.upper())[:50]
    sector = IndustrySector(name=clean, code=code, description=None)
    db.add(sector)
    db.flush()
    caches.sectors_by_name[normalize_text(clean)] = sector
    caches.sectors_by_name[clean] = sector
    return str(sector.id), "CREATED", True


def map_job_role(name: str, caches: MapperCaches, db: Session) -> tuple[str | None, str, bool, bool]:
    clean = name.strip()
    norm = normalize_text(clean)

    # Exact match
    for rname, role in caches.roles_by_name.items():
        if rname == clean:
            return str(role.id), "MATCHED", False, False

    # Normalized match
    for rname, role in caches.roles_by_name.items():
        if normalize_text(rname) == norm:
            return str(role.id), "MATCHED_NORMALIZED", False, False

    # Create new role
    role = JobRole(title=clean, description=None, is_active=True)
    db.add(role)
    db.flush()
    caches.roles_by_name[normalize_text(clean)] = role
    caches.roles_by_name[clean] = role
    return str(role.id), "CREATED", True, False


def _tokens(value: str) -> set[str]:
    return set(normalize_text(value).split())


def _word_overlap_ratio(a: str, b: str) -> float:
    tokens_a = _tokens(a)
    tokens_b = _tokens(b)
    if not tokens_a or not tokens_b:
        return 0.0
    overlap = tokens_a & tokens_b
    min_len = min(len(tokens_a), len(tokens_b))
    return len(overlap) / min_len if min_len > 0 else 0.0


def _find_skill_for_part(part: str, caches: MapperCaches) -> Skill | None:
    norm = normalize_text(part)
    skill = caches.skills_by_name.get(norm)
    if skill:
        return skill
    alias = caches.skill_aliases_by_name.get(norm)
    if alias:
        return alias  # SkillAlias is returned; caller must resolve to Skill via db
    # Conservative partial match: word overlap >= 0.5
    best_skill = None
    best_ratio = 0.0
    part_tokens = _tokens(part)
    for s in caches.skills_by_name.values():
        if isinstance(s, Skill):
            ratio = _word_overlap_ratio(part, s.name)
            if ratio > best_ratio:
                best_ratio = ratio
                best_skill = s
    for a in caches.skill_aliases_by_name.values():
        if isinstance(a, SkillAlias):
            skill_obj = caches.skills_by_name.get(normalize_text(a.alias))
            if not skill_obj:
                continue
            ratio = _word_overlap_ratio(part, a.alias)
            if ratio > best_ratio:
                best_ratio = ratio
                best_skill = skill_obj
    if best_skill and best_ratio >= 0.5:
        return best_skill
    return None


def parse_skill_gap(text: str, caches: MapperCaches) -> tuple[list[str], str]:
    clean = _blank_to_none(text) or text
    parts = re.split(r"\s*[+,&]\s*|\s*,\s*", clean)
    parts = [p.strip() for p in parts if p.strip()]

    mapped: list[str] = []
    seen_ids: set[str] = set()
    status_parts: list[str] = []

    for part in parts:
        skill = _find_skill_for_part(part, caches)
        if skill:
            if skill.id not in seen_ids:
                mapped.append(str(skill.id))
                seen_ids.add(skill.id)
            status_parts.append("matched")
        else:
            status_parts.append("unmapped")

    if all(s == "matched" for s in status_parts):
        status = "ALL_MATCHED"
    elif any(s == "matched" for s in status_parts):
        status = "PARTIAL"
    else:
        status = "UNMAPPED"

    return mapped, status


def map_training_program(text: str, caches: MapperCaches) -> tuple[str | None, str]:
    clean = _blank_to_none(text) or text
    norm = normalize_text(clean)
    for tname, course in caches.courses_by_name.items():
        if normalize_text(tname) == norm:
            return str(course.id), "MATCHED"
    return None, "UNMAPPED"


def map_training_availability(text: str, caches: MapperCaches) -> tuple[str | None, str]:
    clean = _blank_to_none(text) or text
    norm = normalize_text(clean)
    for pname, provider in caches.providers_by_name.items():
        if normalize_text(pname) == norm:
            return str(provider.id), "MATCHED"
    return None, "UNMAPPED"


# ─────────────────────────────────────────────────────────────────────
# Import logic
# ─────────────────────────────────────────────────────────────────────
def get_or_create_source(db: Session) -> DataSource:
    source = db.scalar(select(DataSource).where(DataSource.name == SOURCE_NAME))
    if source:
        return source
    source = DataSource(
        name=SOURCE_NAME,
        source_category=SOURCE_CATEGORY,
        description=SOURCE_DESCRIPTION,
        source_url=None,
        organization=None,
        status="active",
    )
    db.add(source)
    db.flush()
    return source


def get_or_create_district_plan(db: Session, district_id: str, source_id: str) -> DistrictTrainingPlan:
    plan = db.scalar(
        select(DistrictTrainingPlan).where(
            DistrictTrainingPlan.district_id == district_id,
            DistrictTrainingPlan.period_start == IMPORT_PERIOD_START,
            DistrictTrainingPlan.period_end == IMPORT_PERIOD_END,
        )
    )
    if plan:
        return plan
    from app.models.identity import User
    admin = db.scalar(select(User).where(User.is_active == True))  # noqa: E712
    created_by = admin.id if admin else None
    plan = DistrictTrainingPlan(
        district_id=district_id,
        period_start=IMPORT_PERIOD_START,
        period_end=IMPORT_PERIOD_END,
        status="draft",
        created_by_user_id=created_by,
    )
    db.add(plan)
    db.flush()
    return plan


def build_import_plan(db: Session, audit: SourceFileAudit, dry_run: bool = False) -> dict[str, Any]:
    caches = MapperCaches()
    caches.load(db)
    source = get_or_create_source(db)

    proficiency = caches.proficiency_by_code.get(DEFAULT_PROFICIENCY_CODE)
    if not proficiency:
        raise RuntimeError(f"Proficiency level {DEFAULT_PROFICIENCY_CODE} not found in DB")

    results: list[RowResult] = []
    seen_fingerprints: dict[str, int] = {}

    # Check idempotency: if a run already exists for this source+sha256, skip
    existing_run = db.scalar(
        select(DataIngestionRun).where(
            DataIngestionRun.source_id == source.id,
            DataIngestionRun.status == "completed",
            DataIngestionRun.error_summary == f"sha256:{audit.sha256}",
        )
    )
    if existing_run and not dry_run:
        return {
            "dry_run": dry_run,
            "source": SOURCE_NAME,
            "total_rows": audit.row_count,
            "imported": existing_run.records_accepted,
            "rejected": existing_run.records_rejected,
            "needs_review": 0,
            "duplicates": existing_run.records_deduplicated,
            "message": f"Idempotent skip: run {existing_run.id} already processed this file.",
        }

    run = DataIngestionRun(
        source_id=source.id,
        started_at=datetime.now(timezone.utc),
        records_received=audit.row_count,
    )
    db.add(run)
    db.flush()

    accepted = rejected = needs_review = duplicates = 0

    for line_number, raw in enumerate(audit.rows, start=2):
        fp = row_fingerprint(raw)
        if fp in seen_fingerprints:
            duplicates += 1
            continue
        seen_fingerprints[fp] = line_number

        res = RowResult(row_number=line_number, fingerprint=fp, raw=raw)

        # District
        district_name = raw.get("District", "").strip()
        res.district_id, res.district_status = map_district(district_name, caches)
        if res.district_status == "AMBIGUOUS_MUMBAI":
            res.status = "rejected"
            res.reason = "District 'Mumbai' is ambiguous (Mumbai City vs Mumbai Suburban)"
            rejected += 1
            db.add(IngestionRejectedRecord(
                ingestion_run_id=run.id,
                record_key=fp,
                reason_code="ambiguous_district",
                reason_detail=res.reason,
                raw_payload=raw,
            ))
            results.append(res)
            continue
        if not res.district_id:
            res.status = "rejected"
            res.reason = f"District '{district_name}' not found in database"
            rejected += 1
            db.add(IngestionRejectedRecord(
                ingestion_run_id=run.id,
                record_key=fp,
                reason_code="unmapped_district",
                reason_detail=res.reason,
                raw_payload=raw,
            ))
            results.append(res)
            continue

        # Sector
        sector_name = raw.get("Sector", "").strip()
        res.sector_id, res.sector_status, res.sector_created = map_sector(sector_name, caches, db)

        # Job Role
        role_name = raw.get("Skill/Job Role", "").strip()
        res.job_role_id, res.job_role_status, res.job_role_created, _ = map_job_role(role_name, caches, db)

        # Skill Gap
        skill_gap_text = raw.get("Skill Gap", "").strip()
        res.skill_gap_text = skill_gap_text
        mapped_skill_ids, res.skill_gap_status = parse_skill_gap(skill_gap_text, caches)
        res.mapped_skill_ids = mapped_skill_ids

        # Demand Level
        demand_text = raw.get("Demand Level", "").strip()
        demand_score = DEMAND_LEVEL_MAP.get(normalize_text(demand_text))
        res.demand_score = demand_score
        res.demand_status = "MAPPED" if demand_score is not None else "UNMAPPED"

        # Recommended / Training / Availability
        res.recommended_text = raw.get("Recommended", "").strip()
        res.training_program_text = raw.get("Training Program", "").strip()
        res.training_availability_text = raw.get("Training Available At", "").strip()

        # Decision
        if res.skill_gap_status == "UNMAPPED":
            res.status = "needs_review"
            res.reason = "Skill gap could not be mapped to existing skills"
            needs_review += 1
        elif res.demand_status == "UNMAPPED":
            res.status = "rejected"
            res.reason = f"Demand level '{demand_text}' not recognized"
            rejected += 1
            db.add(IngestionRejectedRecord(
                ingestion_run_id=run.id,
                record_key=fp,
                reason_code="unmapped_demand_level",
                reason_detail=res.reason,
                raw_payload=raw,
            ))
        else:
            res.status = "accepted"
            accepted += 1

        results.append(res)

    if not dry_run:
        # Persist accepted rows
        for res in results:
            if res.status != "accepted":
                continue

            # IndustryDemand: one record per mapped skill
            for skill_id in res.mapped_skill_ids:
                demand = IndustryDemand(
                    skill_id=skill_id,
                    job_role_id=res.job_role_id,
                    industry_sector_id=res.sector_id,
                    district_id=res.district_id,
                    proficiency_level_id=proficiency.id,
                    aggregate_demand_score=res.demand_score,
                    period_start=IMPORT_PERIOD_START,
                    period_end=IMPORT_PERIOD_END,
                    generated_at=datetime.now(timezone.utc),
                )
                db.add(demand)
                db.flush()
                res.demand_id = str(demand.id)

            # District Training Plan
            plan = get_or_create_district_plan(db, res.district_id, source.id)

            # Recommended action logic
            gap = res.demand_score or 0
            if gap >= 3:
                action = "new_course"
                rationale = (
                    f"High demand ({res.demand_score}) for {raw.get('Skill/Job Role', '')} "
                    f"in {district_name}; no mapped training capacity exists."
                )
            elif gap >= 2:
                action = "curriculum_update"
                rationale = (
                    f"Medium-High demand ({res.demand_score}) for {raw.get('Skill/Job Role', '')} "
                    f"in {district_name}; existing curricula may need updating."
                )
            else:
                action = "trainer_upskilling"
                rationale = (
                    f"Medium demand ({res.demand_score}) for {raw.get('Skill/Job Role', '')} "
                    f"in {district_name}; trainer upskilling recommended."
                )

            for skill_id in res.mapped_skill_ids:
                item = DistrictTrainingPlanItem(
                    plan_id=plan.id,
                    skill_id=skill_id,
                    job_role_id=res.job_role_id,
                    proficiency_level_id=proficiency.id,
                    course_id=None,
                    demand_value=res.demand_score,
                    supply_value=0.0,
                    gap_value=res.demand_score,
                    recommended_action=action,
                    rationale=rationale,
                )
                db.add(item)
                db.flush()
                res.plan_item_id = str(item.id)

        run.records_accepted = accepted
        run.records_rejected = rejected
        run.records_deduplicated = duplicates
        run.status = "completed"
        run.completed_at = datetime.now(timezone.utc)
        run.error_summary = f"sha256:{audit.sha256}"
        db.commit()
    else:
        db.rollback()

    # Build report
    report = {
        "dry_run": dry_run,
        "source": SOURCE_NAME,
        "source_file": audit.filename,
        "file_sha256": audit.sha256,
        "total_rows": audit.row_count,
        "imported": accepted,
        "rejected": rejected,
        "needs_review": needs_review,
        "duplicates": duplicates,
    }

    # District mapping
    district_map: dict[str, dict[str, int]] = {}
    for res in results:
        district_map.setdefault(res.district_status, 0)
        district_map[res.district_status] += 1
    report["district_mapping"] = district_map

    # Sector mapping
    sector_map: dict[str, int] = {}
    for res in results:
        sector_map.setdefault(res.sector_status, 0)
        sector_map[res.sector_status] += 1
    report["sector_mapping"] = sector_map

    # Job role mapping
    role_map: dict[str, int] = {}
    for res in results:
        role_map.setdefault(res.job_role_status, 0)
        role_map[res.job_role_status] += 1
    report["job_role_mapping"] = role_map

    # Skill mapping
    skill_map: dict[str, int] = {}
    for res in results:
        skill_map.setdefault(res.skill_gap_status, 0)
        skill_map[res.skill_gap_status] += 1
    report["skill_mapping"] = skill_map

    # Training mapping
    training_program_unmapped = sum(
        1 for res in results if res.training_program_text and "MATCHED" not in res.training_program_text
    )
    report["training_program_unmapped"] = training_program_unmapped

    training_avail_unmapped = sum(
        1 for res in results if res.training_availability_text and "MATCHED" not in res.training_availability_text
    )
    report["training_availability_unmapped"] = training_avail_unmapped

    # Rejection reasons
    rejection_reasons: dict[str, int] = {}
    for res in results:
        if res.status == "rejected":
            rejection_reasons.setdefault(res.reason or "unknown", 0)
            rejection_reasons[res.reason] += 1
    report["rejection_reasons"] = rejection_reasons

    # Review items
    review_items = [
        {
            "row": res.row_number,
            "district": res.raw.get("District", ""),
            "sector": res.raw.get("Sector", ""),
            "role": res.raw.get("Skill/Job Role", ""),
            "skill_gap": res.skill_gap_text,
            "reason": res.reason,
        }
        for res in results if res.status == "needs_review"
    ]
    report["needs_review_items"] = review_items

    return report


# ─────────────────────────────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────────────────────────────
def main(argv: list[str] | None = None) -> int:
    argv = argv or sys.argv[1:]
    dry_run = "--dry-run" in argv

    if not DATA_FILE.exists():
        print(f"ERROR: Data file not found at {DATA_FILE}")
        return 1

    print(f"Auditing: {DATA_FILE}")
    audit = audit_source_file(DATA_FILE)
    print(f"  Rows: {audit.row_count}")
    print(f"  SHA256: {audit.sha256}")
    print(f"  Duplicates in file: {len(audit.duplicate_keys)}")
    print(f"  Headers: {audit.headers}")
    print()

    with SessionLocal() as db:
        report = build_import_plan(db, audit, dry_run=dry_run)

    print("=" * 60)
    print("IMPORT REPORT")
    print("=" * 60)
    for k, v in report.items():
        if k in ("needs_review_items", "rejection_reasons", "district_mapping",
                 "sector_mapping", "job_role_mapping", "skill_mapping"):
            print(f"{k}:")
            if isinstance(v, dict):
                for kk, vv in v.items():
                    print(f"  {kk}: {vv}")
            elif isinstance(v, list):
                for item in v[:10]:
                    print(f"  {item}")
                if len(v) > 10:
                    print(f"  ... ({len(v)} total)")
            continue
        print(f"{k}: {v}")

    if dry_run:
        print("\nDRY RUN — no database changes made.")
    else:
        print("\nIMPORT COMPLETED.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
