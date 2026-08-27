"""
Idempotent role seed data.
Run: python -m app.seeds.roles
"""

from app.core.database import SessionLocal
from app.models.auth import Role

ROLES = [
    {"name": "candidate",          "description": "Job-seeking candidate or student."},
    {"name": "employer",           "description": "Employer posting jobs and validating skills."},
    {"name": "training_provider",  "description": "Training institute offering courses."},
    {"name": "government_admin",   "description": "Maharashtra government administrator. Privileged — not self-assignable."},
    {"name": "government_official", "description": "Registered government official awaiting/holding approval. Dashboard access granted only after admin approval."},
]


def seed_roles() -> None:
    db = SessionLocal()
    try:
        for role_data in ROLES:
            existing = db.query(Role).filter(Role.name == role_data["name"]).first()
            if not existing:
                db.add(Role(**role_data))
                print(f"  [+] Created role: {role_data['name']}")
            else:
                print(f"  [=] Role exists: {role_data['name']}")
        db.commit()
        print("Role seed complete.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_roles()
