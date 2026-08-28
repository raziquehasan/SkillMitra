"""Idempotently seed Maharashtra geography from the official district listing.

Source: https://plan.maharashtra.gov.in/en/36-districts/
The source does not expose district codes in the page listing, so code remains
NULL rather than being inferred.
"""
from sqlalchemy import select
from app.core.database import SessionLocal
from app.models.demand import DataSource
from app.models.geography import District, State

SOURCE_URL = "https://plan.maharashtra.gov.in/en/36-districts/"
DISTRICT_NAMES = [
    "Mumbai City", "Thane", "Ratnagiri", "Pune", "Sangli", "Kolhapur",
    "Dhule", "Ahilyanagar", "Chhatrapati Sambhajinagar", "Parbhani", "Beed",
    "Dharashiv", "Nagpur", "Bhandara", "Gadchiroli", "Amravati", "Yavatmal",
    "Washim", "Mumbai Suburban", "Raigad", "Sindhudurg", "Satara", "Solapur",
    "Nashik", "Jalgaon", "Nandurbar", "Jalna", "Nanded", "Latur", "Hingoli",
    "Wardha", "Chandrapur", "Gondia", "Akola", "Buldhana", "Palghar",
]


def seed() -> int:
    with SessionLocal() as db:
        source = db.scalar(select(DataSource).where(DataSource.source_url == SOURCE_URL))
        if not source:
            source = DataSource(
                name="Maharashtra Planning Department - 36 Districts",
                source_category="government",
                organization="Government of Maharashtra, Planning Department",
                source_url=SOURCE_URL,
                description="Official district-wise scheme listing used as geography provenance.",
            )
            db.add(source)
            db.flush()
        state = db.scalar(select(State).where(State.code == "MH"))
        if not state:
            state = State(name="Maharashtra", code="MH")
            db.add(state)
            db.flush()
        existing = set(db.scalars(select(District.name).where(District.state_id == state.id)).all())
        added = 0
        for name in DISTRICT_NAMES:
            if name not in existing:
                db.add(District(state_id=state.id, name=name, code=None))
                added += 1
        db.commit()
        return added


if __name__ == "__main__":
    print(f"Added {seed()} Maharashtra district records")
