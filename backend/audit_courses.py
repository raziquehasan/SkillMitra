"""CLI for Phase 7B-2 MSSDS/NCVT course master source audit and import."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys

from app.services.course_master_import import (
    CourseMasterImportError,
    attach_database_conflict_audit,
    build_course_import_plan,
    compare_source_exports,
    get_or_create_course_master_source,
    get_course_master_source,
    import_course_master,
    load_industry_sector_lookup,
    plan_summary,
)


DEFAULT_OLDER = "../database/Ncvt_Courses_list_27-08-26_01_09_18.xls"
DEFAULT_NEWER = "../database/Ncvt_Courses_list_27-08-26_01_11_48.xls"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--older", default=DEFAULT_OLDER, help="Earlier TSV export with .xls extension")
    parser.add_argument("--newer", default=DEFAULT_NEWER, help="Later TSV export with .xls extension")
    parser.add_argument("--json", action="store_true", help="Print machine-readable audit output")
    parser.add_argument("--import", dest="do_import", action="store_true", help="Insert accepted records after dry-run passes")
    return parser.parse_args()


def resolve_path(value: str) -> Path:
    path = Path(value)
    if path.is_absolute():
        return path
    return (Path(__file__).resolve().parent / path).resolve()


def main() -> int:
    args = parse_args()
    comparison = compare_source_exports(resolve_path(args.older), resolve_path(args.newer))
    plan = build_course_import_plan(comparison)

    # Source contradictions must stop before importing DB configuration or opening a session.
    if plan.blocked:
        print_report(plan, args.json)
        return 2

    from app.core.database import SessionLocal

    with SessionLocal() as db:
        sector_lookup = load_industry_sector_lookup(db)
        plan = build_course_import_plan(comparison, industry_sector_lookup=sector_lookup)
        source = get_course_master_source(db)
        if source:
            attach_database_conflict_audit(db, plan, source)
        print_report(plan, args.json)

        if plan.blocked:
            db.rollback()
            return 2
        if not args.do_import:
            db.rollback()
            return 0
        db.rollback()

        try:
            with SessionLocal() as import_db:
                import_course_master(import_db, plan)
        except CourseMasterImportError as exc:
            print(str(exc), file=sys.stderr)
            return 2

    return 0


def print_report(plan, as_json: bool) -> None:
    summary = plan_summary(plan)
    if as_json:
        print(json.dumps(summary, indent=2, sort_keys=True, default=str))
        return

    older = summary["source_audit"]["older"]
    newer = summary["source_audit"]["newer"]
    dry_run = summary["dry_run"]
    print("=== SOURCE AUDIT ===")
    for label, audit in (("Older", older), ("Newer", newer)):
        print(f"{label}: {audit['filename']}")
        print(f"  Size: {audit['size_bytes']} bytes")
        print(f"  SHA-256: {audit['sha256']}")
        print(f"  Rows: {audit['row_count']}")
        print(f"  Header valid: {not audit['errors']}")

    print("\n=== COMPARISON ===")
    print(f"Newer is superset by Course Code + Version: {summary['comparison']['newer_is_superset']}")
    print(f"Only in older: {len(summary['comparison']['only_in_older'])}")
    print(f"Only in newer: {summary['comparison']['only_in_newer_count']}")
    print(f"Contradictions: {summary['comparison']['contradiction_count']}")
    for contradiction in summary["comparison"]["contradictions"]:
        print(f"  {tuple(contradiction['identity'])}: {contradiction['differences']}")

    print("\n=== DRY RUN ===")
    print(f"Blocked: {summary['blocked']}")
    print(f"Blocked reason: {summary['blocked_reason']}")
    print(f"Received: {dry_run['received']}")
    print(f"Accepted: {dry_run['accepted']}")
    print(f"Rejected: {dry_run['rejected']}")
    print(f"Deduplicated: {dry_run['deduplicated']}")
    print(f"Unmapped sectors: {dry_run['unmapped_sector_count']}")


if __name__ == "__main__":
    raise SystemExit(main())
