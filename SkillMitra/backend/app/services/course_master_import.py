"""Phase 7B-2 MSSDS/NCVT course master audit and import helpers."""

from __future__ import annotations

import csv
import hashlib
from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
from io import StringIO
from pathlib import Path
import re
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from sqlalchemy.orm import Session
    from app.models.career import Course
    from app.models.demand import DataSource
    from app.models.phase6 import DataIngestionRun


EXPECTED_HEADERS: tuple[str, ...] = (
    "Sr No.",
    "Sector",
    "Course Code",
    "Course Name",
    "Qualification",
    "Course Duration",
    "Cost Category",
    "Rate Per Hour",
    "NSQF Level",
    "NQR Code",
    "Version",
)

MATERIAL_COMPARE_HEADERS = tuple(header for header in EXPECTED_HEADERS if header != "Sr No.")
SOURCE_NAME = "MSSDS/NCVT Course Master TSV export"
SOURCE_CATEGORY = "course_master"
SOURCE_ORGANIZATION = "MSSDS/NCVT"


class CourseMasterImportError(RuntimeError):
    """Raised when the import cannot proceed without breaking audit rules."""


@dataclass(frozen=True)
class SourceFileAudit:
    path: Path
    filename: str
    size_bytes: int
    sha256: str
    headers: tuple[str, ...]
    rows: tuple[dict[str, str], ...]
    errors: tuple[str, ...] = ()
    duplicate_identity_conflicts: tuple[dict[str, Any], ...] = ()

    @property
    def row_count(self) -> int:
        return len(self.rows)

    @property
    def is_valid_tsv(self) -> bool:
        return not self.errors


@dataclass(frozen=True)
class SourceComparison:
    older: SourceFileAudit
    newer: SourceFileAudit
    newer_is_superset: bool
    only_in_older: tuple[tuple[str, str], ...]
    only_in_newer: tuple[tuple[str, str], ...]
    contradictions: tuple[dict[str, Any], ...]

    @property
    def blocked(self) -> bool:
        return (
            bool(self.older.errors)
            or bool(self.newer.errors)
            or bool(self.older.duplicate_identity_conflicts)
            or bool(self.newer.duplicate_identity_conflicts)
            or bool(self.only_in_older)
            or bool(self.contradictions)
        )

    @property
    def block_reason(self) -> str | None:
        if self.older.errors or self.newer.errors:
            return "SOURCE_FORMAT_INVALID"
        if self.older.duplicate_identity_conflicts or self.newer.duplicate_identity_conflicts:
            return "SOURCE_INTERNAL_DUPLICATE_CONFLICT"
        if self.only_in_older:
            return "SOURCE_NOT_SUPERSET"
        if self.contradictions:
            return "SOURCE_CONTRADICTION"
        return None


@dataclass(frozen=True)
class NormalizedCourseRecord:
    source_row: dict[str, str]
    source_filename: str
    source_record_identifier: str
    sector_name: str | None
    source_course_code: str
    title: str
    qualification: str | None
    duration_hours: int | None
    cost_category: str | None
    rate_per_hour: Decimal | None
    nsqf_level: int | None
    nqr_code: str | None
    source_version: str
    industry_sector_id: Any | None = None
    sector_mapping_status: str = "unmapped"

    @property
    def identity_key(self) -> tuple[str, str]:
        return self.source_course_code, self.source_version

    @property
    def nqr_version_key(self) -> tuple[str, str] | None:
        if not self.nqr_code:
            return None
        return self.nqr_code, self.source_version


@dataclass(frozen=True)
class RejectedRecord:
    record_key: str
    reason_code: str
    reason_detail: str
    raw_payload: dict[str, str]


@dataclass
class CourseImportPlan:
    comparison: SourceComparison
    accepted_records: list[NormalizedCourseRecord] = field(default_factory=list)
    rejected_records: list[RejectedRecord] = field(default_factory=list)
    deduplicated_count: int = 0
    unmapped_sector_count: int = 0
    existing_skipped_count: int = 0
    blocked_reason: str | None = None
    database_conflicts: list[dict[str, Any]] = field(default_factory=list)

    @property
    def blocked(self) -> bool:
        return bool(self.blocked_reason or self.database_conflicts or self.comparison.blocked)

    @property
    def records_received(self) -> int:
        return self.comparison.newer.row_count


def _blank_to_none(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = re.sub(r"\s+", " ", value.strip())
    if not cleaned or cleaned == "-":
        return None
    return cleaned


def _identity(row: dict[str, str]) -> tuple[str, str]:
    return row.get("Course Code", "").strip(), row.get("Version", "").strip()


def _source_index(audit: SourceFileAudit) -> dict[tuple[str, str], dict[str, str]]:
    return {_identity(row): row for row in audit.rows if _identity(row) != ("", "")}


def _material_values(row: dict[str, str]) -> dict[str, str]:
    return {header: row.get(header, "").strip() for header in MATERIAL_COMPARE_HEADERS}


def audit_tsv_export(path: Path) -> SourceFileAudit:
    raw_bytes = path.read_bytes()
    sha256 = hashlib.sha256(raw_bytes).hexdigest()
    text = raw_bytes.decode("utf-8-sig")
    reader = csv.reader(StringIO(text), delimiter="\t")
    errors: list[str] = []
    raw_rows = [tuple(cell.strip() for cell in row) for row in reader if any(cell.strip() for cell in row)]

    if not raw_rows:
        return SourceFileAudit(path, path.name, len(raw_bytes), sha256, (), (), ("empty_source_file",))

    headers = raw_rows[0]
    if headers != EXPECTED_HEADERS:
        errors.append("headers_do_not_match_expected_order")

    rows: list[dict[str, str]] = []
    seen: dict[tuple[str, str], dict[str, str]] = {}
    duplicate_conflicts: list[dict[str, Any]] = []
    for line_number, raw_row in enumerate(raw_rows[1:], start=2):
        if len(raw_row) != len(headers):
            errors.append(f"line_{line_number}_has_{len(raw_row)}_columns_expected_{len(headers)}")
            continue
        row = dict(zip(headers, raw_row, strict=True))
        rows.append(row)
        key = _identity(row)
        if key == ("", ""):
            errors.append(f"line_{line_number}_missing_course_code_and_version")
            continue
        previous = seen.get(key)
        if previous and _material_values(previous) != _material_values(row):
            duplicate_conflicts.append(
                {
                    "identity": key,
                    "first": _material_values(previous),
                    "second": _material_values(row),
                }
            )
        seen.setdefault(key, row)

    return SourceFileAudit(
        path=path,
        filename=path.name,
        size_bytes=len(raw_bytes),
        sha256=sha256,
        headers=headers,
        rows=tuple(rows),
        errors=tuple(errors),
        duplicate_identity_conflicts=tuple(duplicate_conflicts),
    )


def compare_source_exports(older_path: Path, newer_path: Path) -> SourceComparison:
    older = audit_tsv_export(older_path)
    newer = audit_tsv_export(newer_path)
    older_index = _source_index(older)
    newer_index = _source_index(newer)
    older_keys = set(older_index)
    newer_keys = set(newer_index)

    contradictions: list[dict[str, Any]] = []
    for key in sorted(older_keys & newer_keys):
        old_values = _material_values(older_index[key])
        new_values = _material_values(newer_index[key])
        differences = {
            header: {"older": old_values[header], "newer": new_values[header]}
            for header in MATERIAL_COMPARE_HEADERS
            if old_values[header] != new_values[header]
        }
        if differences:
            contradictions.append({"identity": key, "differences": differences})

    return SourceComparison(
        older=older,
        newer=newer,
        newer_is_superset=older_keys.issubset(newer_keys),
        only_in_older=tuple(sorted(older_keys - newer_keys)),
        only_in_newer=tuple(sorted(newer_keys - older_keys)),
        contradictions=tuple(contradictions),
    )


def _parse_int(value: str | None, field_name: str) -> int | None:
    cleaned = _blank_to_none(value)
    if cleaned is None:
        return None
    if not re.fullmatch(r"\d+", cleaned):
        raise ValueError(f"{field_name} must be a non-negative integer")
    return int(cleaned)


def _parse_decimal(value: str | None, field_name: str) -> Decimal | None:
    cleaned = _blank_to_none(value)
    if cleaned is None:
        return None
    try:
        parsed = Decimal(cleaned.replace(",", ""))
    except InvalidOperation as exc:
        raise ValueError(f"{field_name} must be numeric") from exc
    if parsed < 0:
        raise ValueError(f"{field_name} must be non-negative")
    return parsed


def normalize_course_row(
    row: dict[str, str],
    *,
    source_filename: str,
    industry_sector_lookup: dict[str, Any] | None = None,
) -> NormalizedCourseRecord:
    code = _blank_to_none(row.get("Course Code"))
    version = _blank_to_none(row.get("Version"))
    title = _blank_to_none(row.get("Course Name"))
    if not code:
        raise ValueError("Course Code is required")
    if not version:
        raise ValueError("Version is required")
    if not title:
        raise ValueError("Course Name is required")

    sector_name = _blank_to_none(row.get("Sector"))
    lookup_key = normalize_lookup_key(sector_name) if sector_name else ""
    sector_id = (industry_sector_lookup or {}).get(lookup_key)
    sector_status = "exact" if sector_id else "unmapped"

    sr_no = _blank_to_none(row.get("Sr No.")) or code
    return NormalizedCourseRecord(
        source_row=row,
        source_filename=source_filename,
        source_record_identifier=f"{source_filename}:{sr_no}",
        sector_name=sector_name,
        source_course_code=code,
        title=title,
        qualification=_blank_to_none(row.get("Qualification")),
        duration_hours=_parse_int(row.get("Course Duration"), "Course Duration"),
        cost_category=_blank_to_none(row.get("Cost Category")),
        rate_per_hour=_parse_decimal(row.get("Rate Per Hour"), "Rate Per Hour"),
        nsqf_level=_parse_int(row.get("NSQF Level"), "NSQF Level"),
        nqr_code=_blank_to_none(row.get("NQR Code")),
        source_version=version,
        industry_sector_id=sector_id,
        sector_mapping_status=sector_status,
    )


def normalize_lookup_key(value: str | None) -> str:
    return re.sub(r"\s+", " ", (value or "").strip()).casefold()


def build_course_import_plan(
    comparison: SourceComparison,
    *,
    industry_sector_lookup: dict[str, Any] | None = None,
) -> CourseImportPlan:
    plan = CourseImportPlan(comparison=comparison, blocked_reason=comparison.block_reason)
    if comparison.blocked:
        return plan

    seen_identity: dict[tuple[str, str], NormalizedCourseRecord] = {}
    seen_nqr_version: dict[tuple[str, str], NormalizedCourseRecord] = {}
    for row in comparison.newer.rows:
        record_key = ":".join(_identity(row))
        try:
            record = normalize_course_row(
                row,
                source_filename=comparison.newer.filename,
                industry_sector_lookup=industry_sector_lookup,
            )
        except ValueError as exc:
            plan.rejected_records.append(RejectedRecord(record_key, "VALIDATION_ERROR", str(exc), row))
            continue

        previous = seen_identity.get(record.identity_key)
        if previous:
            if previous.source_row == record.source_row:
                plan.deduplicated_count += 1
            else:
                plan.rejected_records.append(
                    RejectedRecord(record_key, "DUPLICATE_IDENTITY_CONFLICT", "Course Code + Version conflict", row)
                )
            continue

        nqr_key = record.nqr_version_key
        if nqr_key and nqr_key in seen_nqr_version:
            plan.rejected_records.append(
                RejectedRecord(record_key, "DUPLICATE_NQR_VERSION_CONFLICT", "NQR Code + Version conflict", row)
            )
            continue

        seen_identity[record.identity_key] = record
        if nqr_key:
            seen_nqr_version[nqr_key] = record
        if record.sector_mapping_status == "unmapped":
            plan.unmapped_sector_count += 1
        plan.accepted_records.append(record)

    return plan


def load_industry_sector_lookup(db: "Session") -> dict[str, Any]:
    from sqlalchemy import select
    from app.models.demand import IndustrySector

    sectors = db.scalars(select(IndustrySector)).all()
    return {normalize_lookup_key(sector.name): sector.id for sector in sectors}


def attach_database_conflict_audit(db: "Session", plan: CourseImportPlan, source: "DataSource") -> CourseImportPlan:
    from sqlalchemy import select
    from app.models.career import Course

    existing_courses = db.scalars(select(Course).where(Course.data_source_id == source.id)).all()
    by_course_code = {course.source_course_code: course for course in existing_courses if course.source_course_code}
    by_nqr_version = {
        (course.nqr_code, course.source_version): course
        for course in existing_courses
        if course.nqr_code and course.source_version
    }

    accepted: list[NormalizedCourseRecord] = []
    for record in plan.accepted_records:
        existing = by_course_code.get(record.source_course_code)
        if existing:
            if _course_matches_record(existing, record):
                plan.existing_skipped_count += 1
                continue
            plan.database_conflicts.append(
                {"identity": record.identity_key, "reason": "existing_source_course_code_differs"}
            )
            continue

        nqr_key = record.nqr_version_key
        if nqr_key and nqr_key in by_nqr_version:
            plan.database_conflicts.append({"identity": record.identity_key, "reason": "existing_nqr_version_differs"})
            continue
        accepted.append(record)

    plan.accepted_records = accepted
    if plan.database_conflicts:
        plan.blocked_reason = "DATABASE_IDENTITY_CONFLICT"
    return plan


def _course_matches_record(course: "Course", record: NormalizedCourseRecord) -> bool:
    return (
        course.title == record.title
        and course.qualification == record.qualification
        and course.duration_hours == record.duration_hours
        and course.cost_category == record.cost_category
        and course.rate_per_hour == record.rate_per_hour
        and course.nsqf_level == record.nsqf_level
        and course.nqr_code == record.nqr_code
        and course.source_version == record.source_version
    )


def get_or_create_course_master_source(db: "Session") -> "DataSource":
    from sqlalchemy import select
    from app.models.demand import DataSource

    source = get_course_master_source(db)
    if source:
        return source
    source = DataSource(
        name=SOURCE_NAME,
        source_category=SOURCE_CATEGORY,
        description="Local TSV export imported from the original NCVT course master files.",
        source_url=None,
        organization=SOURCE_ORGANIZATION,
        status="active",
    )
    db.add(source)
    db.flush()
    return source


def get_course_master_source(db: "Session") -> "DataSource | None":
    from sqlalchemy import select
    from app.models.demand import DataSource

    return db.scalar(select(DataSource).where(DataSource.name == SOURCE_NAME))


def import_course_master(db: "Session", plan: CourseImportPlan) -> tuple["DataIngestionRun", dict[str, int]]:
    if plan.blocked:
        raise CourseMasterImportError(f"Course import blocked: {plan.blocked_reason or 'audit_failed'}")

    from app.models.career import Course
    from app.models.phase6 import DataIngestionRun

    now = datetime.now(timezone.utc)
    with db.begin():
        source = get_or_create_course_master_source(db)
        run = DataIngestionRun(
            source_id=source.id,
            started_at=now,
            records_received=plan.records_received,
            records_rejected=len(plan.rejected_records),
            records_deduplicated=plan.deduplicated_count + plan.existing_skipped_count,
        )
        db.add(run)
        db.flush()

        for record in plan.accepted_records:
            db.add(
                Course(
                    title=record.title,
                    description=None,
                    status="active",
                    duration_hours=record.duration_hours,
                    source_course_code=record.source_course_code,
                    qualification=record.qualification,
                    cost_category=record.cost_category,
                    rate_per_hour=record.rate_per_hour,
                    nsqf_level=record.nsqf_level,
                    nqr_code=record.nqr_code,
                    source_version=record.source_version,
                    industry_sector_id=record.industry_sector_id,
                    data_source_id=source.id,
                    ingestion_run_id=run.id,
                    source_record_identifier=record.source_record_identifier,
                )
            )

        run.records_accepted = len(plan.accepted_records)
        run.status = "completed"
        run.completed_at = datetime.now(timezone.utc)

    return run, {
        "received": plan.records_received,
        "accepted": len(plan.accepted_records),
        "rejected": len(plan.rejected_records),
        "deduplicated": plan.deduplicated_count + plan.existing_skipped_count,
    }


def plan_summary(plan: CourseImportPlan) -> dict[str, Any]:
    comparison = plan.comparison
    return {
        "source_audit": {
            "older": _audit_summary(comparison.older),
            "newer": _audit_summary(comparison.newer),
        },
        "comparison": {
            "newer_is_superset": comparison.newer_is_superset,
            "only_in_older": list(comparison.only_in_older),
            "only_in_newer_count": len(comparison.only_in_newer),
            "contradiction_count": len(comparison.contradictions),
            "contradictions": list(comparison.contradictions),
        },
        "blocked": plan.blocked,
        "blocked_reason": plan.blocked_reason or comparison.block_reason,
        "dry_run": {
            "received": plan.records_received,
            "accepted": len(plan.accepted_records),
            "rejected": len(plan.rejected_records),
            "deduplicated": plan.deduplicated_count,
            "existing_skipped": plan.existing_skipped_count,
            "unmapped_sector_count": plan.unmapped_sector_count,
            "database_conflict_count": len(plan.database_conflicts),
        },
    }


def _audit_summary(audit: SourceFileAudit) -> dict[str, Any]:
    return {
        "filename": audit.filename,
        "size_bytes": audit.size_bytes,
        "sha256": audit.sha256,
        "headers": list(audit.headers),
        "row_count": audit.row_count,
        "errors": list(audit.errors),
        "duplicate_identity_conflicts": list(audit.duplicate_identity_conflicts),
    }
