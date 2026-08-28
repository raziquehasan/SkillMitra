"""Improve skill taxonomy for Maharashtra dataset import.

This script:
1. Reads all unique skill gap terms from the CSV
2. Proposes canonical skills and aliases
3. Creates new skills where justified
4. Assigns skill categories
5. Connects job roles to skills
6. Re-runs import for review rows
"""
from __future__ import annotations

import csv
import os
import re
import sys
from collections import Counter
from dataclasses import dataclass, field
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any

os.environ["DEBUG"] = "False"

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.career import JobRole, JobRoleSkill
from app.models.demand import DataSource, IndustryDemand, IndustrySector
from app.models.geography import District
from app.models.phase4 import DistrictTrainingPlan, DistrictTrainingPlanItem
from app.models.phase6 import DataIngestionRun, IngestionRejectedRecord
from app.models.skills import Skill, SkillAlias, SkillCategory, SkillProficiencyLevel

PROJECT_ROOT = Path(__file__).resolve().parents[3]
DATA_FILE = PROJECT_ROOT / "data" / "district_wise_skill_data_merged.csv.xls"
SOURCE_NAME = "Maharashtra District-wise Skill Demand Dataset"

# ─────────────────────────────────────────────────────────────────────
# Skill gap -> canonical skill mapping proposals
# ─────────────────────────────────────────────────────────────────────
# Format: { "canonical_skill_name": { "category": "...", "aliases": [...], "source_terms": [...] } }
SKILL_PROPOSALS: dict[str, dict[str, Any]] = {
    # Existing skills - just add aliases
    "Industrial Safety": {
        "category": "Soft Skills",
        "skill_type": "soft",
        "aliases": ["safety", "Fire safety", "road safety", "electrical safety"],
        "source_terms": ["safety", "Fire safety", "road safety", "electrical safety"],
        "existing": True,
    },
    "CNC Machine Operation": {
        "category": "Mechanical",
        "skill_type": "technical",
        "aliases": ["CNC programming", "CNC operation", "machining", "machine skills", "Machinery", "modern machinery", "Modern machinery", "CNC"],
        "source_terms": ["CNC programming", "CNC operation", "machining", "machine skills", "Machinery", "modern machinery", "Modern machinery", "CNC"],
        "existing": True,
    },
    "Communication": {
        "category": "Soft Skills",
        "skill_type": "soft",
        "aliases": [],
        "source_terms": [],
        "existing": True,
    },
    "Data Analysis": {
        "category": "Digital",
        "skill_type": "technical",
        "aliases": ["analytics", "data handling"],
        "source_terms": ["analytics", "data handling"],
        "existing": True,
    },
    "Python Programming": {
        "category": "Digital",
        "skill_type": "technical",
        "aliases": ["Python"],
        "source_terms": ["Python"],
        "existing": True,
    },
    "Web Development": {
        "category": "Digital",
        "skill_type": "technical",
        "aliases": ["Web technologies", "HTML/CSS/JS", "moden frameworks"],
        "source_terms": ["Web technologies", "HTML/CSS/JS", "moden frameworks"],
        "existing": True,
    },
    # New canonical skills
    "Microsoft Excel": {
        "category": "Digital",
        "skill_type": "technical",
        "aliases": ["Excel", "Advanced Excel"],
        "source_terms": ["Excel", "Advanced Excel"],
        "existing": False,
    },
    "EV Technology": {
        "category": "Automotive",
        "skill_type": "technical",
        "aliases": ["EV", "EV systems", "EV battery", "EV components", "EV operation", "battery systems"],
        "source_terms": ["EV", "EV systems", "EV battery", "EV components", "EV operation", "battery systems"],
        "existing": False,
    },
    "EV Diagnostics": {
        "category": "Automotive",
        "skill_type": "technical",
        "aliases": ["EV diagnostics", "Advanced diagnostics", "advanced diagnostics"],
        "source_terms": ["EV diagnostics", "Advanced diagnostics", "advanced diagnostics"],
        "existing": False,
    },
    "Electrical Technology": {
        "category": "Electrical",
        "skill_type": "technical",
        "aliases": ["electrical", "Electrical installation", "electrical troubleshooting", "electrical skills", "electrical repair", "electrical safety", "Industrial electrical", "Wiring", "wiring", "Electrical wiring", "electrical systems", "Vehicle electrical", "Transformer production"],
        "source_terms": ["electrical", "Electrical installation", "electrical troubleshooting", "electrical skills", "electrical repair", "electrical safety", "Industrial electrical", "Wiring", "wiring", "Electrical wiring", "electrical systems", "Vehicle electrical", "Transformer production"],
        "existing": False,
    },
    "Solar Installation": {
        "category": "Electrical",
        "skill_type": "technical",
        "aliases": ["Solar installation", "Solar PV"],
        "source_terms": ["Solar installation", "Solar PV"],
        "existing": False,
    },
    "HVAC": {
        "category": "Mechanical",
        "skill_type": "technical",
        "aliases": ["HVAC", "Refrigeration"],
        "source_terms": ["HVAC", "Refrigeration"],
        "existing": False,
    },
    "Fabrication": {
        "category": "Mechanical",
        "skill_type": "technical",
        "aliases": ["Fabrication", "fabrication", "Modern fabrication"],
        "source_terms": ["Fabrication", "fabrication", "Modern fabrication"],
        "existing": False,
    },
    "Maintenance": {
        "category": "Mechanical",
        "skill_type": "technical",
        "aliases": ["maintenance", "Mechanical maintenance"],
        "source_terms": ["maintenance", "Mechanical maintenance"],
        "existing": False,
    },
    "Diagnostics": {
        "category": "Automotive",
        "skill_type": "technical",
        "aliases": ["diagnostics", "Diagnostics", "troubleshooting", "Troubleshooting", "Advanced troubleshooting"],
        "source_terms": ["diagnostics", "Diagnostics", "troubleshooting", "Troubleshooting", "Advanced troubleshooting"],
        "existing": False,
    },
    "Networking": {
        "category": "Digital",
        "skill_type": "technical",
        "aliases": ["networking", "Networking"],
        "source_terms": ["networking", "Networking"],
        "existing": False,
    },
    "Digital Tools": {
        "category": "Digital",
        "skill_type": "technical",
        "aliases": ["Digital tools", "digital skills", "Digital", "Digital content", "online services", "digital booking"],
        "source_terms": ["Digital tools", "digital skills", "Digital", "Digital content", "online services", "digital booking"],
        "existing": False,
    },
    "Drone Technology": {
        "category": "Digital",
        "skill_type": "technical",
        "aliases": ["Drone operation", "Drone repair", "Drone electronics"],
        "source_terms": ["Drone operation", "Drone repair", "Drone electronics"],
        "existing": False,
    },
    "Tally": {
        "category": "Digital",
        "skill_type": "technical",
        "aliases": ["Tally"],
        "source_terms": ["Tally"],
        "existing": False,
    },
    "GST": {
        "category": "Digital",
        "skill_type": "technical",
        "aliases": ["GST"],
        "source_terms": ["GST"],
        "existing": False,
    },
    "Documentation": {
        "category": "Soft Skills",
        "skill_type": "soft",
        "aliases": ["documentation"],
        "source_terms": ["documentation"],
        "existing": False,
    },
    "ERP": {
        "category": "Digital",
        "skill_type": "technical",
        "aliases": ["ERP"],
        "source_terms": ["ERP"],
        "existing": False,
    },
    "CAD/CAM": {
        "category": "Mechanical",
        "skill_type": "technical",
        "aliases": ["CAD/CAM", "CAD", "technical drawing"],
        "source_terms": ["CAD/CAM", "CAD", "technical drawing"],
        "existing": False,
    },
    "Quality Control": {
        "category": "Mechanical",
        "skill_type": "technical",
        "aliases": ["QC", "quality control"],
        "source_terms": ["QC", "quality control"],
        "existing": False,
    },
    "AI Tools": {
        "category": "Digital",
        "skill_type": "technical",
        "aliases": ["AI tools", "Al tools"],
        "source_terms": ["AI tools", "Al tools"],
        "existing": False,
    },
    "Automation": {
        "category": "Mechanical",
        "skill_type": "technical",
        "aliases": ["automation"],
        "source_terms": ["automation"],
        "existing": False,
    },
    "Driving": {
        "category": "Logistics",
        "skill_type": "technical",
        "aliases": ["Driving"],
        "source_terms": ["Driving"],
        "existing": False,
    },
    "Production": {
        "category": "Mechanical",
        "skill_type": "technical",
        "aliases": ["production", "production skills", "garment production"],
        "source_terms": ["production", "production skills", "garment production"],
        "existing": False,
    },
    "Healthcare Skills": {
        "category": "Healthcare",
        "skill_type": "technical",
        "aliases": ["Practical healthcare skills"],
        "source_terms": ["Practical healthcare skills"],
        "existing": False,
    },
    "Hardware": {
        "category": "Digital",
        "skill_type": "technical",
        "aliases": ["Hardware", "Hardware repair"],
        "source_terms": ["Hardware", "Hardware repair"],
        "existing": False,
    },
    "Electronics": {
        "category": "Electrical",
        "skill_type": "technical",
        "aliases": ["electronics", "Electronics troubleshooting", "Drone electronics"],
        "source_terms": ["electronics", "Electronics troubleshooting", "Drone electronics"],
        "existing": False,
    },
    "Surveillance": {
        "category": "Security",
        "skill_type": "technical",
        "aliases": ["surveillance"],
        "source_terms": ["surveillance"],
        "existing": False,
    },
    "Welding": {
        "category": "Mechanical",
        "skill_type": "technical",
        "aliases": ["Modern welding"],
        "source_terms": ["Modern welding"],
        "existing": False,
    },
    "Refrigeration": {
        "category": "Mechanical",
        "skill_type": "technical",
        "aliases": ["Refrigeration"],
        "source_terms": ["Refrigeration"],
        "existing": False,
    },
    "Agriculture Technology": {
        "category": "Agriculture",
        "skill_type": "technical",
        "aliases": ["agri-tech", "Modern agriculture", "precision farming"],
        "source_terms": ["agri-tech", "Modern agriculture", "precision farming"],
        "existing": False,
    },
    "Emergency Response": {
        "category": "Safety",
        "skill_type": "technical",
        "aliases": ["emergency response"],
        "source_terms": ["emergency response"],
        "existing": False,
    },
    "Plumbing": {
        "category": "Construction",
        "skill_type": "technical",
        "aliases": ["Modern plumbing"],
        "source_terms": ["Modern plumbing"],
        "existing": False,
    },
    "Automotive Body Repair": {
        "category": "Automotive",
        "skill_type": "technical",
        "aliases": ["Modern body repair", "painting"],
        "source_terms": ["Modern body repair", "painting"],
        "existing": False,
    },
    "Surface Treatment": {
        "category": "Mechanical",
        "skill_type": "technical",
        "aliases": ["Surface treatment"],
        "source_terms": ["Surface treatment"],
        "existing": False,
    },
    "Dairy Management": {
        "category": "Agriculture",
        "skill_type": "technical",
        "aliases": ["Modern dairy management"],
        "source_terms": ["Modern dairy management"],
        "existing": False,
    },
    "Logistics": {
        "category": "Logistics",
        "skill_type": "technical",
        "aliases": ["Digital logistics", "route planning"],
        "source_terms": ["Digital logistics", "route planning"],
        "existing": False,
    },
    "Salon Skills": {
        "category": "Beauty",
        "skill_type": "technical",
        "aliases": ["Advanced salon skills"],
        "source_terms": ["Advanced salon skills"],
        "existing": False,
    },
    "Wellness Skills": {
        "category": "Healthcare",
        "skill_type": "soft",
        "aliases": ["Practical wellness skills"],
        "source_terms": ["Practical wellness skills"],
        "existing": False,
    },
    "Surveying": {
        "category": "Construction",
        "skill_type": "technical",
        "aliases": ["Surveying tools"],
        "source_terms": ["Surveying tools"],
        "existing": False,
    },
    "Industrial Sewing": {
        "category": "Textile",
        "skill_type": "technical",
        "aliases": ["Industrial sewing"],
        "source_terms": ["Industrial sewing"],
        "existing": False,
    },
    "Inventory Management": {
        "category": "Logistics",
        "skill_type": "technical",
        "aliases": ["inventory management"],
        "source_terms": ["inventory management"],
        "existing": False,
    },
}


# ─────────────────────────────────────────────────────────────────────
# Helper functions
# ─────────────────────────────────────────────────────────────────────
def normalize_text(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def get_or_create_category(db: Session, name: str) -> SkillCategory:
    category = db.scalar(select(SkillCategory).where(SkillCategory.name == name))
    if category:
        return category
    category = SkillCategory(name=name, description=None)
    db.add(category)
    db.flush()
    return category


def get_or_create_skill(db: Session, name: str, category_name: str, skill_type: str = "technical") -> Skill:
    skill = db.scalar(select(Skill).where(Skill.name == name))
    if skill:
        return skill
    category = get_or_create_category(db, category_name)
    skill = Skill(name=name, category_id=category.id, skill_type=skill_type, description=None, is_active=True)
    db.add(skill)
    db.flush()
    return skill


def create_alias(db: Session, skill_id: str, alias: str) -> None:
    existing = db.scalar(select(SkillAlias).where(SkillAlias.alias == alias))
    if existing:
        return
    alias_obj = SkillAlias(skill_id=skill_id, alias=alias)
    db.add(alias_obj)


def get_proficiency_level(db: Session, code: str = "L3") -> SkillProficiencyLevel:
    level = db.scalar(select(SkillProficiencyLevel).where(SkillProficiencyLevel.code == code))
    if not level:
        raise RuntimeError(f"Proficiency level {code} not found")
    return level


# ─────────────────────────────────────────────────────────────────────
# Import logic
# ─────────────────────────────────────────────────────────────────────
def improve_skill_taxonomy(db: Session) -> dict[str, Any]:
    """Create new skills, aliases, and categories based on proposals."""
    stats = {
        "skills_created": 0,
        "aliases_created": 0,
        "categories_created": 0,
        "skills_existing": 0,
    }

    existing_skills = {normalize_text(s.name): s for s in db.scalars(select(Skill)).all()}

    for canonical_name, proposal in SKILL_PROPOSALS.items():
        category_name = proposal["category"]
        
        # Get or create category
        category = db.scalar(select(SkillCategory).where(SkillCategory.name == category_name))
        if not category:
            category = SkillCategory(name=category_name, description=None)
            db.add(category)
            db.flush()
            stats["categories_created"] += 1

        # Get or create skill
        norm_name = normalize_text(canonical_name)
        skill = existing_skills.get(norm_name)
        if not skill:
            skill = db.scalar(select(Skill).where(Skill.name == canonical_name))
        if not skill:
            skill = Skill(name=canonical_name, category_id=category.id, skill_type=proposal.get("skill_type", "technical"), description=None, is_active=True)
            db.add(skill)
            db.flush()
            existing_skills[norm_name] = skill
            stats["skills_created"] += 1
        else:
            stats["skills_existing"] += 1

        # Create aliases
        for alias_term in proposal.get("aliases", []):
            existing_alias = db.scalar(select(SkillAlias).where(SkillAlias.alias == alias_term))
            if existing_alias:
                continue
            alias_obj = SkillAlias(skill_id=skill.id, alias=alias_term)
            db.add(alias_obj)
            stats["aliases_created"] += 1

    db.commit()
    return stats


@dataclass
class SkillCache:
    skills_by_name: dict[str, Skill] = field(default_factory=dict)
    aliases_by_name: dict[str, SkillAlias] = field(default_factory=dict)
    proposals: dict[str, dict[str, Any]] = field(default_factory=dict)

    def load(self, db: Session) -> None:
        for s in db.scalars(select(Skill)).all():
            self.skills_by_name[normalize_text(s.name)] = s
            self.skills_by_name[s.name.strip()] = s
        for a in db.scalars(select(SkillAlias)).all():
            self.aliases_by_name[normalize_text(a.alias)] = a
            self.aliases_by_name[a.alias.strip()] = a
        self.proposals = SKILL_PROPOSALS


def get_skill_for_term(term: str, cache: SkillCache, db: Session) -> tuple[str | None, str]:
    """Find canonical skill ID for a term. Returns (skill_id, method)."""
    norm = normalize_text(term)
    
    # Exact match
    skill = cache.skills_by_name.get(term.strip())
    if skill:
        return str(skill.id), "EXACT"
    
    # Normalized match
    skill = cache.skills_by_name.get(norm)
    if skill:
        return str(skill.id), "NORMALIZED"
    
    # Alias match
    alias = cache.aliases_by_name.get(norm)
    if alias:
        return str(alias.skill_id), "ALIAS"
    
    # Check proposals
    for canonical_name, proposal in cache.proposals.items():
        if normalize_text(canonical_name) == norm:
            skill = cache.skills_by_name.get(normalize_text(canonical_name))
            if skill:
                return str(skill.id), "PROPOSAL"
        for alias_term in proposal.get("aliases", []):
            if normalize_text(alias_term) == norm:
                skill = cache.skills_by_name.get(normalize_text(canonical_name))
                if skill:
                    return str(skill.id), "ALIAS"
    
    return None, "UNMAPPED"


def parse_skill_gap_v2(db: Session, text: str, cache: SkillCache) -> tuple[list[str], str]:
    """Parse skill gap text and return mapped skill IDs and status."""
    clean = text.strip()
    if not clean or clean == "-":
        return [], "UNMAPPED"
    
    # Split by delimiters
    parts = re.split(r"\s*[+,&]\s*|\s*,\s*", clean)
    parts = [p.strip() for p in parts if p.strip()]
    
    mapped: list[str] = []
    seen_ids: set[str] = set()
    statuses: list[str] = []
    
    for part in parts:
        skill_id, method = get_skill_for_term(part, cache, db)
        if skill_id:
            if skill_id not in seen_ids:
                mapped.append(skill_id)
                seen_ids.add(skill_id)
            statuses.append("matched")
        else:
            statuses.append("unmapped")
    
    if all(s == "matched" for s in statuses):
        return mapped, "ALL_MATCHED"
    elif any(s == "matched" for s in statuses):
        return mapped, "PARTIAL"
    else:
        return mapped, "UNMAPPED"


def get_or_create_source(db: Session) -> DataSource:
    source = db.scalar(select(DataSource).where(DataSource.name == SOURCE_NAME))
    if source:
        return source
    source = DataSource(
        name=SOURCE_NAME,
        source_category="district_skill_demand",
        description="District-wise skill demand dataset for Maharashtra.",
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
            DistrictTrainingPlan.period_start == date(2024, 4, 1),
            DistrictTrainingPlan.period_end == date(2025, 3, 31),
        )
    )
    if plan:
        return plan
    from app.models.identity import User
    admin = db.scalar(select(User).where(User.is_active == True))  # noqa: E712
    created_by = admin.id if admin else None
    plan = DistrictTrainingPlan(
        district_id=district_id,
        period_start=date(2024, 4, 1),
        period_end=date(2025, 3, 31),
        status="draft",
        created_by_user_id=created_by,
    )
    db.add(plan)
    db.flush()
    return plan


def row_fingerprint(row: dict[str, str]) -> str:
    import hashlib
    key = "|".join(
        row.get(col, "").strip().casefold()
        for col in ("District", "Sector", "Skill/Job Role", "Demand Level", "Skill Gap")
    )
    return hashlib.sha256(key.encode()).hexdigest()


DEMAND_LEVEL_MAP = {
    "high": 3.0,
    "medium high": 2.0,
    "medium": 1.0,
}
DEFAULT_PROFICIENCY_CODE = "L3"
IMPORT_PERIOD_START = date(2024, 4, 1)
IMPORT_PERIOD_END = date(2025, 3, 31)


def process_review_rows(db: Session, dry_run: bool = False) -> dict[str, Any]:
    """Re-process review rows from the CSV."""
    source = get_or_create_source(db)
    proficiency = get_proficiency_level(db, DEFAULT_PROFICIENCY_CODE)
    cache = SkillCache()
    cache.load(db)
    
    # Load existing data
    districts = {d.name.strip(): d for d in db.scalars(select(District)).all()}
    sectors = {normalize_text(s.name): s for s in db.scalars(select(IndustrySector)).all()}
    roles = {normalize_text(r.title): r for r in db.scalars(select(JobRole)).all()}
    
    # Read CSV
    with open(DATA_FILE, "r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    
    # Find existing ingestion run for this source
    run = db.scalar(
        select(DataIngestionRun).where(
            DataIngestionRun.source_id == source.id,
            DataIngestionRun.status == "completed",
        ).order_by(DataIngestionRun.started_at.desc())
    )
    
    accepted = rejected = needs_review = 0
    review_items = []
    accepted_items = []
    
    for line_number, raw in enumerate(rows, start=2):
        fp = row_fingerprint(raw)
        
        # District
        district_name = raw.get("District", "").strip()
        if district_name == "Mumbai":
            rejected += 1
            continue
        
        district = districts.get(district_name)
        if not district:
            rejected += 1
            continue
        
        # Sector
        sector_name = raw.get("Sector", "").strip()
        norm_sector = normalize_text(sector_name)
        sector = sectors.get(norm_sector)
        if not sector:
            # Try to find by exact name
            sector = db.scalar(select(IndustrySector).where(IndustrySector.name == sector_name))
        if not sector:
            rejected += 1
            continue
        
        # Job Role
        role_name = raw.get("Skill/Job Role", "").strip()
        norm_role = normalize_text(role_name)
        role = roles.get(norm_role)
        if not role:
            role = db.scalar(select(JobRole).where(JobRole.title == role_name))
        if not role:
            # Create new role if needed
            role = JobRole(title=role_name, description=None, is_active=True)
            db.add(role)
            db.flush()
            roles[norm_role] = role
        
        # Skill Gap
        skill_gap_text = raw.get("Skill Gap", "").strip()
        mapped_skill_ids, skill_gap_status = parse_skill_gap_v2(db, skill_gap_text, cache)
        
        # Demand Level
        demand_text = raw.get("Demand Level", "").strip()
        demand_score = DEMAND_LEVEL_MAP.get(normalize_text(demand_text))
        
        if skill_gap_status == "UNMAPPED":
            needs_review += 1
            review_items.append({
                "row": line_number,
                "district": district_name,
                "sector": sector_name,
                "role": role_name,
                "skill_gap": skill_gap_text,
                "reason": "Skill gap could not be mapped to existing skills",
            })
            continue
        
        if demand_score is None:
            rejected += 1
            continue
        
        # Create IndustryDemand
        for skill_id in mapped_skill_ids:
            # Check if already exists
            existing = db.scalar(
                select(IndustryDemand).where(
                    IndustryDemand.skill_id == skill_id,
                    IndustryDemand.job_role_id == role.id,
                    IndustryDemand.industry_sector_id == sector.id,
                    IndustryDemand.district_id == district.id,
                    IndustryDemand.period_start == IMPORT_PERIOD_START,
                    IndustryDemand.period_end == IMPORT_PERIOD_END,
                )
            )
            if existing:
                continue
            
            demand = IndustryDemand(
                skill_id=skill_id,
                job_role_id=role.id,
                industry_sector_id=sector.id,
                district_id=district.id,
                proficiency_level_id=proficiency.id,
                aggregate_demand_score=demand_score,
                period_start=IMPORT_PERIOD_START,
                period_end=IMPORT_PERIOD_END,
                generated_at=datetime.now(timezone.utc),
            )
            db.add(demand)
        
        # Create District Training Plan
        plan = get_or_create_district_plan(db, district.id, source.id)
        
        # Determine recommended action
        training_program = raw.get("Training Program", "").strip()
        training_availability = raw.get("Training Available At", "").strip()
        
        if demand_score >= 3:
            action = "new_course"
            rationale = f"High demand ({demand_score}) for {role_name} in {district_name}; training capacity needs expansion."
        elif demand_score >= 2:
            action = "curriculum_update"
            rationale = f"Medium-High demand ({demand_score}) for {role_name} in {district_name}; curricula may need updating."
        else:
            action = "trainer_upskilling"
            rationale = f"Medium demand ({demand_score}) for {role_name} in {district_name}; trainer upskilling recommended."
        
        # Append source training information
        if training_program:
            rationale += f" Training program (source): {training_program}."
        if training_availability:
            rationale += f" Training available at (source): {training_availability}."
        
        for skill_id in mapped_skill_ids:
            # Check if plan item already exists
            existing_item = db.scalar(
                select(DistrictTrainingPlanItem).where(
                    DistrictTrainingPlanItem.plan_id == plan.id,
                    DistrictTrainingPlanItem.skill_id == skill_id,
                    DistrictTrainingPlanItem.job_role_id == role.id,
                )
            )
            if existing_item:
                continue
            
            item = DistrictTrainingPlanItem(
                plan_id=plan.id,
                skill_id=skill_id,
                job_role_id=role.id,
                proficiency_level_id=proficiency.id,
                course_id=None,
                demand_value=demand_score,
                supply_value=0.0,
                gap_value=demand_score,
                recommended_action=action,
                rationale=rationale,
            )
            db.add(item)
        
        accepted += 1
        accepted_items.append({
            "row": line_number,
            "district": district_name,
            "sector": sector_name,
            "role": role_name,
            "skill_gap": skill_gap_text,
            "mapped_skills": len(mapped_skill_ids),
            "action": action,
        })
    
    if not dry_run:
        db.commit()
    
    return {
        "accepted": accepted,
        "rejected": rejected,
        "needs_review": needs_review,
        "review_items": review_items,
        "accepted_items": accepted_items,
    }


def connect_job_roles_to_skills(db: Session, cache: SkillCache) -> dict[str, Any]:
    """Connect imported job roles to relevant skills based on source data."""
    stats = {
        "connections_created": 0,
        "roles_processed": 0,
    }
    
    proficiency = get_proficiency_level(db, "L2")
    
    # Read CSV and build role-skill mapping
    with open(DATA_FILE, "r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    
    # Build role -> skills mapping from CSV
    role_skills: dict[str, set[str]] = {}
    for raw in rows:
        role_name = raw.get("Skill/Job Role", "").strip()
        skill_gap = raw.get("Skill Gap", "").strip()
        if not role_name or not skill_gap:
            continue
        
        parts = re.split(r"\s*[+,&]\s*|\s*,\s*", skill_gap)
        skill_ids = set()
        for part in parts:
            part = part.strip()
            if not part:
                continue
            skill_id, _ = get_skill_for_term(part, cache, db)
            if skill_id:
                skill_ids.add(skill_id)
        
        if skill_ids:
            role_skills.setdefault(role_name, set()).update(skill_ids)
    
    # Create job_role_skills entries
    for role_name, skill_ids in role_skills.items():
        role = db.scalar(select(JobRole).where(JobRole.title == role_name))
        if not role:
            continue
        
        for skill_id in skill_ids:
            existing = db.scalar(
                select(JobRoleSkill).where(
                    JobRoleSkill.job_role_id == role.id,
                    JobRoleSkill.skill_id == skill_id,
                )
            )
            if existing:
                continue
            
            jrs = JobRoleSkill(
                job_role_id=role.id,
                skill_id=skill_id,
                proficiency_level_id=proficiency.id,
                importance="preferred",
                years_experience_required=1,
            )
            db.add(jrs)
            stats["connections_created"] += 1
        
        stats["roles_processed"] += 1
    
    db.commit()
    return stats


def main() -> int:
    import argparse
    parser = argparse.ArgumentParser(description="Improve Maharashtra skill taxonomy and re-process review rows")
    parser.add_argument("--dry-run", action="store_true", help="Preview changes without modifying database")
    parser.add_argument("--skip-taxonomy", action="store_true", help="Skip skill taxonomy improvement")
    parser.add_argument("--skip-reprocess", action="store_true", help="Skip re-processing review rows")
    parser.add_argument("--skip-job-roles", action="store_true", help="Skip job role-skill connections")
    args = parser.parse_args()
    
    dry_run = args.dry_run
    
    with SessionLocal() as db:
        # Step 1: Improve skill taxonomy
        if not args.skip_taxonomy:
            print("=" * 60)
            print("STEP 1: IMPROVE SKILL TAXONOMY")
            print("=" * 60)
            taxonomy_stats = improve_skill_taxonomy(db)
            print(f"Skills created: {taxonomy_stats['skills_created']}")
            print(f"Skills existing: {taxonomy_stats['skills_existing']}")
            print(f"Aliases created: {taxonomy_stats['aliases_created']}")
            print(f"Categories created: {taxonomy_stats['categories_created']}")
        
        # Load cache for subsequent steps
        cache = SkillCache()
        cache.load(db)
        
        # Step 2: Connect job roles to skills
        if not args.skip_job_roles:
            print("\n" + "=" * 60)
            print("STEP 2: CONNECT JOB ROLES TO SKILLS")
            print("=" * 60)
            role_stats = connect_job_roles_to_skills(db, cache)
            print(f"Roles processed: {role_stats['roles_processed']}")
            print(f"Connections created: {role_stats['connections_created']}")
        
        # Step 3: Re-process review rows
        if not args.skip_reprocess:
            print("\n" + "=" * 60)
            print("STEP 3: RE-PROCESS REVIEW ROWS")
            print("=" * 60)
            process_stats = process_review_rows(db, dry_run=dry_run)
            print(f"Accepted: {process_stats['accepted']}")
            print(f"Rejected: {process_stats['rejected']}")
            print(f"Needs review: {process_stats['needs_review']}")
            
            if process_stats["review_items"]:
                print("\nStill needs review:")
                for item in process_stats["review_items"][:10]:
                    print(f"  Row {item['row']}: {item['role']} - {item['skill_gap']}")
                    print(f"    Reason: {item['reason']}")
                if len(process_stats["review_items"]) > 10:
                    print(f"  ... and {len(process_stats['review_items']) - 10} more")
    
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
