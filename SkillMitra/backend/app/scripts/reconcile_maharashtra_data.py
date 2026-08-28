"""Final Maharashtra data reconciliation and database integration."""
from __future__ import annotations

import csv
import hashlib
import os
import re
import sys
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any

os.environ["DEBUG"] = "False"

import pdfplumber
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.demand import DataSource, IndustryDemand, IndustrySector
from app.models.geography import District
from app.models.phase4 import DistrictTrainingPlan, DistrictTrainingPlanItem
from app.models.phase6 import DataIngestionRun
from app.models.skills import Skill, SkillAlias, SkillProficiencyLevel
import uuid as uuid_module

PROJECT_ROOT = Path(__file__).resolve().parents[3]
CSV_FILE = PROJECT_ROOT / "data" / "district_wise_skill_data_merged.csv.xls"
GOOGLE_SHEET_PDF = PROJECT_ROOT / "data" / "database spreadsheet - Google Sheets.pdf"
DISTRICT_PDF = PROJECT_ROOT / "data" / "district wise data.pdf"

SOURCE_CSV_NAME = "Maharashtra District-wise Skill Demand Dataset"
SOURCE_GOOGLE_NAME = "Maharashtra District-wise Skill Demand — Google Sheet Export"


def normalize_text(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def row_fingerprint(row: dict[str, str]) -> str:
    key = "|".join(
        row.get(col, "").strip().casefold()
        for col in ("District", "Sector", "Skill/Job Role", "Demand Level", "Skill Gap",
                    "Recommended", "Training Program", "Training Available At")
    )
    return hashlib.sha256(key.encode()).hexdigest()


def extract_csv_rows(path: Path) -> list[dict]:
    rows = []
    with open(path, "r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        for raw in reader:
            rows.append(raw)
    return rows


def extract_google_sheet_pdf_rows(path: Path) -> list[dict]:
    rows = []
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            tables = page.extract_tables()
            for table in tables:
                for raw_row in table[1:]:
                    if not raw_row or all(not c for c in raw_row):
                        continue
                    rows.append({
                        "District": (raw_row[0] or "").strip(),
                        "Sector": (raw_row[1] or "").strip(),
                        "Skill/Job Role": (raw_row[2] or "").strip(),
                        "Demand Level": (raw_row[3] or "").strip(),
                        "Skill Gap": (raw_row[4] or "").strip(),
                        "Recommended": (raw_row[5] or "").strip(),
                        "Training Program": (raw_row[6] or "").strip(),
                        "Training Available At": (raw_row[7] or "").strip(),
                    })
    return rows


def compare_sources(csv_rows: list[dict], google_rows: list[dict]) -> dict[str, int]:
    csv_fps = set()
    for r in csv_rows:
        fp = row_fingerprint(r)
        csv_fps.add(fp)
    
    google_fps = set()
    for r in google_rows:
        fp = row_fingerprint(r)
        google_fps.add(fp)
    
    stats = {
        "exact_matches": len(csv_fps & google_fps),
        "csv_only": len(csv_fps - google_fps),
        "google_only": len(google_fps - csv_fps),
    }
    return stats


def get_skill_id_map(db: Session) -> dict[str, str]:
    result = db.execute(text("""
        SELECT id, name FROM skills
        UNION ALL
        SELECT skill_id, alias FROM skill_aliases
    """)).fetchall()
    
    skill_map = {}
    for row in result:
        skill_id = str(row[0])
        name = normalize_text(row[1])
        skill_map[name] = skill_id
    return skill_map


def reconcile_and_import(dry_run: bool = False) -> dict[str, Any]:
    print("=" * 60)
    print("STEP 1: EXTRACT DATA FROM ALL SOURCES")
    print("=" * 60)
    
    csv_rows = extract_csv_rows(CSV_FILE)
    google_rows = extract_google_sheet_pdf_rows(GOOGLE_SHEET_PDF)
    
    print(f"CSV rows: {len(csv_rows)}")
    print(f"Google Sheet PDF rows: {len(google_rows)}")
    print(f"District PDF: image-based reference document, no extractable tables")
    
    print("\n" + "=" * 60)
    print("STEP 2: COMPARE SOURCES")
    print("=" * 60)
    
    comparison = compare_sources(csv_rows, google_rows)
    for k, v in comparison.items():
        print(f"  {k}: {v}")
    
    print("\n" + "=" * 60)
    print("STEP 3: DATABASE RECONCILIATION")
    print("=" * 60)
    
    with SessionLocal() as db:
        csv_source_id = db.execute(text("""
            SELECT id FROM data_sources WHERE name = :name
        """), {"name": SOURCE_CSV_NAME}).fetchone()
        
        if not csv_source_id:
            csv_source_id = db.execute(text("""
                INSERT INTO data_sources (id, name, source_category, description, status, created_at, updated_at)
                VALUES (gen_random_uuid(), :name, :category, :desc, 'active', now(), now())
                RETURNING id
            """), {
                "name": SOURCE_CSV_NAME,
                "category": "district_skill_demand",
                "desc": "District-wise skill demand dataset for Maharashtra (CSV export)."
            }).fetchone()
        csv_source_id = str(csv_source_id[0])
        
        google_source_id = db.execute(text("""
            SELECT id FROM data_sources WHERE name = :name
        """), {"name": SOURCE_GOOGLE_NAME}).fetchone()
        
        if not google_source_id:
            google_source_id = db.execute(text("""
                INSERT INTO data_sources (id, name, source_category, description, status, created_at, updated_at)
                VALUES (gen_random_uuid(), :name, :category, :desc, 'active', now(), now())
                RETURNING id
            """), {
                "name": SOURCE_GOOGLE_NAME,
                "category": "district_skill_demand",
                "desc": "District-wise skill demand dataset exported from Google Sheets."
            }).fetchone()
        google_source_id = str(google_source_id[0])
        
        db.commit()
        
        skill_map = get_skill_id_map(db)
        district_map = {r[0]: str(r[1]) for r in db.execute(text("SELECT name, id FROM districts")).fetchall()}
        
        proficiency = db.execute(text("SELECT id FROM skill_proficiency_levels WHERE code = 'L3'")).fetchone()
        if not proficiency:
            raise RuntimeError("Proficiency level L3 not found")
        prof_id = str(proficiency[0])
        
        # Use raw SQL for bulk operations to avoid connection issues
        accepted = 0
        rejected = 0
        needs_review = 0
        new_demand = 0
        new_plan_items = 0
        
        for raw in csv_rows:
            district_name = raw.get("District", "").strip()
            if district_name == "Mumbai":
                rejected += 1
                continue
            
            district_id = district_map.get(district_name)
            if not district_id:
                rejected += 1
                continue
            
            sector_name = raw.get("Sector", "").strip()
            sector = db.execute(text("""
                SELECT id FROM industry_sectors WHERE name = :name LIMIT 1
            """), {"name": sector_name}).fetchone()
            if not sector:
                code = re.sub(r'[^A-Z0-9]', '_', sector_name.upper())[:50]
                existing_code = db.execute(text("""
                    SELECT id FROM industry_sectors WHERE code = :code LIMIT 1
                """), {"code": code}).fetchone()
                if existing_code:
                    sector_id = str(existing_code[0])
                else:
                    sector_id = db.execute(text("""
                        INSERT INTO industry_sectors (id, name, code, description)
                        VALUES (gen_random_uuid(), :name, :code, NULL)
                        RETURNING id
                    """), {"name": sector_name, "code": code}).fetchone()[0]
            else:
                sector_id = str(sector[0])
            
            role_name = raw.get("Skill/Job Role", "").strip()
            role = db.execute(text("""
                SELECT id FROM job_roles WHERE title = :title LIMIT 1
            """), {"title": role_name}).fetchone()
            if not role:
                role_id = db.execute(text("""
                    INSERT INTO job_roles (id, title, is_active)
                    VALUES (gen_random_uuid(), :title, true)
                    RETURNING id
                """), {"title": role_name}).fetchone()[0]
            else:
                role_id = str(role[0])
            
            demand_text = raw.get("Demand Level", "").strip()
            demand_score = {"high": 3.0, "medium high": 2.0, "medium": 1.0}.get(normalize_text(demand_text))
            if demand_score is None:
                rejected += 1
                continue
            
            skill_gap = raw.get("Skill Gap", "").strip()
            mapped_skill_ids = []
            if skill_gap:
                parts = re.split(r"\s*[+,&]\s*|\s*,\s*", skill_gap)
                for part in parts:
                    part = part.strip()
                    if not part:
                        continue
                    norm = normalize_text(part)
                    sid = skill_map.get(norm)
                    if sid and sid not in mapped_skill_ids:
                        mapped_skill_ids.append(sid)
            
            if not mapped_skill_ids:
                needs_review += 1
                continue
            
            for skill_id in mapped_skill_ids:
                exists = db.execute(text("""
                    SELECT id FROM industry_demand
                    WHERE skill_id = :sid AND district_id = :did
                    AND period_start = '2024-04-01' AND period_end = '2025-03-31'
                    LIMIT 1
                """), {"sid": skill_id, "did": district_id}).fetchone()
                
                if exists:
                    continue
                
                demand = IndustryDemand(
                    skill_id=skill_id,
                    job_role_id=role_id,
                    industry_sector_id=sector_id,
                    district_id=district_id,
                    proficiency_level_id=prof_id,
                    aggregate_demand_score=demand_score,
                    period_start=date(2024, 4, 1),
                    period_end=date(2025, 3, 31),
                    generated_at=datetime.now(timezone.utc),
                )
                db.add(demand)
                db.flush()
                new_demand += 1
            
            plan_exists = db.execute(text("""
                SELECT id FROM district_training_plans
                WHERE district_id = :did AND period_start = '2024-04-01' AND period_end = '2025-03-31'
                LIMIT 1
            """), {"did": district_id}).fetchone()
            
            if plan_exists:
                plan_id = str(plan_exists[0])
            else:
                plan = DistrictTrainingPlan(
                    district_id=district_id,
                    period_start=date(2024, 4, 1),
                    period_end=date(2025, 3, 31),
                    status="draft",
                )
                db.add(plan)
                db.flush()
                plan_id = str(plan.id)
            
            if demand_score >= 3:
                action = "new_course"
            elif demand_score >= 2:
                action = "curriculum_update"
            else:
                action = "trainer_upskilling"
            
            for skill_id in mapped_skill_ids:
                item_exists = db.execute(text("""
                    SELECT id FROM district_training_plan_items
                    WHERE plan_id = :pid AND skill_id = :sid
                    LIMIT 1
                """), {"pid": plan_id, "sid": skill_id}).fetchone()
                
                if item_exists:
                    continue
                
                rationale = f"Source: CSV. {raw.get('Demand Level', '')} demand for {raw.get('Skill/Job Role', '')} in {district_name}."
                if raw.get("Training Program"):
                    rationale += f" Training: {raw['Training Program']}."
                if raw.get("Training Available At"):
                    rationale += f" Available at: {raw['Training Available At']}."
                
                item = DistrictTrainingPlanItem(
                    plan_id=plan_id,
                    skill_id=skill_id,
                    job_role_id=role_id,
                    proficiency_level_id=prof_id,
                    demand_value=demand_score,
                    gap_value=demand_score,
                    recommended_action=action,
                    rationale=rationale,
                )
                db.add(item)
                db.flush()
                new_plan_items += 1
            
            accepted += 1
        
        if not dry_run:
            db.commit()
    
    print(f"Accepted: {accepted}")
    print(f"Rejected: {rejected}")
    print(f"Needs review: {needs_review}")
    print(f"New demand records: {new_demand}")
    print(f"New plan items: {new_plan_items}")
    
    return {
        "csv_rows": len(csv_rows),
        "google_rows": len(google_rows),
        "comparison": comparison,
        "accepted": accepted,
        "rejected": rejected,
        "needs_review": needs_review,
        "new_demand": new_demand,
        "new_plan_items": new_plan_items,
    }


def main() -> int:
    import argparse
    parser = argparse.ArgumentParser(description="Final Maharashtra data reconciliation")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    
    report = reconcile_and_import(dry_run=args.dry_run)
    
    print("\n" + "=" * 60)
    print("FINAL REPORT")
    print("=" * 60)
    for k, v in report.items():
        if isinstance(v, dict):
            print(f"{k}:")
            for kk, vv in v.items():
                print(f"  {kk}: {vv}")
        else:
            print(f"{k}: {v}")
    
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
